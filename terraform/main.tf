# ==============================================================================
# Terraform configuration for 100% Free Tier AWS EC2 Deployment of MediCare SAAS
# ==============================================================================

terraform {
  required_version = ">= 1.0.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

variable "aws_region" {
  description = "AWS region to deploy resources (e.g. us-east-1, ap-south-1)"
  type        = string
  default     = "us-east-1"
}

variable "key_name" {
  description = "Name of your existing EC2 Key Pair (PEM) in AWS to enable SSH"
  type        = string
  default     = ""
}

variable "instance_type" {
  description = "Free Tier eligible EC2 instance type"
  type        = string
  default     = "t2.micro"
}

provider "aws" {
  region = var.aws_region
}

# Fetch the latest Ubuntu 22.04 LTS Free Tier eligible AMI
data "aws_ami" "ubuntu" {
  most_recent = true
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
  owners = ["099720109477"] # Canonical
}

# Free tier security group allowing SSH, HTTP (User Frontend), and Port 8080 (Admin Portal)
resource "aws_security_group" "medicare_sg" {
  name        = "medicare_saas_sg"
  description = "Allow HTTP, Admin Port, and SSH inbound traffic"

  # SSH Access
  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # User Frontend & API
  ingress {
    description = "HTTP User App and API"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Admin Dashboard
  ingress {
    description = "Admin Dashboard"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Outbound internet access to pull docker images and packages
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "medicare-security-group"
  }
}

# Free Tier EC2 Instance (t2.micro / t3.micro with 30GB gp3 storage)
resource "aws_instance" "medicare_server" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.instance_type
  key_name      = var.key_name != "" ? var.key_name : null

  vpc_security_group_ids = [aws_security_group.medicare_sg.id]

  # Root disk configuration (30GB is 100% Free Tier on AWS)
  root_block_device {
    volume_size           = 30
    volume_type           = "gp3"
    delete_on_termination = true
  }

  # Cloud-init User Data to automatically install Docker, Docker Compose, and configure 2GB Swap memory
  user_data = <<-EOF
              #!/bin/bash
              set -e

              # 1. Update and install prerequisites
              apt-get update -y
              apt-get install -y ca-certificates curl gnupg lsb-release git

              # 2. Add 2GB Swap Memory (Crucial for t2.micro 1GB RAM to build Vite smoothly)
              fallocate -l 2G /swapfile
              chmod 600 /swapfile
              mkswap /swapfile
              swapon /swapfile
              echo '/swapfile none swap sw 0 0' >> /etc/fstab

              # 3. Install Docker Engine and Docker Compose Plugin
              mkdir -p /etc/apt/keyrings
              curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
              echo \
                "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
                $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

              apt-get update -y
              apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

              # 4. Start & enable Docker service
              systemctl start docker
              systemctl enable docker
              usermod -aG docker ubuntu

              echo "Docker and Swap installed successfully!" > /var/log/user_data_complete.log
              EOF

  tags = {
    Name = "MediCare-SAAS-Server"
  }
}

# Output the public IP and URLs for immediate submission
output "public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = aws_instance.medicare_server.public_ip
}

output "user_portal_url" {
  description = "Live URL for Patient & Doctor Portal"
  value       = "http://${aws_instance.medicare_server.public_ip}"
}

output "admin_portal_url" {
  description = "Live URL for Admin Dashboard"
  value       = "http://${aws_instance.medicare_server.public_ip}:8080"
}

output "api_health_check_url" {
  description = "Live URL for Backend API Health check"
  value       = "http://${aws_instance.medicare_server.public_ip}/api/doctors"
}
