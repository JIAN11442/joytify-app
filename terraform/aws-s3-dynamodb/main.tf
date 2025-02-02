// create s3 bucket
resource "aws_s3_bucket" "bucket" {
    bucket = "joytify-tfstate-bucket-yj"
    force_destroy = true
}

// create dynamodb table
resource "aws_dynamodb_table" "dynamodb_tb" {
    name = "joytify-tfstate-lock-table"
    hash_key = "LockID"
    billing_mode = "PAY_PER_REQUEST"

    attribute {
        name = "LockID"
        type = "S"
    }
}