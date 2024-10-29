variable "project_id" {
  description = "The ID of the Google Cloud project"
}

variable "source_image_family" {
  description = "The image family to use as a base for the new image"
}

variable "ssh_username" {
  description = "The username for SSH access"
}

variable "zone" {
  description = "The zone in which to create the image"
}

variable "service_file_source" {
  description = "Path to the service file to be copied"
}

variable "webapp_zip_source" {
  description = "Path to the webapp zip file to be copied"
}

variable "nodejs_script" {
  description = "Path to the Node.js provisioning script"
}

variable "opsAgent_script" {
  description = "Path to the Node.js provisioning script"
}

variable "service_file_destination" {
  description = "Destination path for the service file"
}

variable "webapp_zip_destination" {
  description = "Destination path for the webapp zip file"
}

packer {
  required_plugins {
    googlecompute = {
      source  = "github.com/hashicorp/googlecompute"
      version = ">= 1"
    }
  }
}

source "googlecompute" "Webapp-packer" {
  project_id          = var.project_id
  source_image_family = var.source_image_family
  image_name          = "centos-stream-8-${formatdate("YYYY-MM-DD-hh-mm-ss", timestamp())}"
  ssh_username        = var.ssh_username
  zone                = var.zone
}

build {
  sources = ["source.googlecompute.Webapp-packer"]

  provisioner "file" {
    source      = var.service_file_source
    destination = var.service_file_destination
  }
  provisioner "file" {
    source      = var.webapp_zip_source
    destination = var.webapp_zip_destination
  }

  provisioner "shell" {
    script = var.nodejs_script
  }

  provisioner "shell" {
    script = var.opsAgent_script
  }


}

 