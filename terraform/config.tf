terraform {
    backend "s3" {
        bucket = "joytify-tfstate-bucket-yj"
        key = "terraform/state.tfstate"
        region = "ap-northeast-1"
        dynamodb_table = "joytify-tfstate-lock-table"
        encrypt = true
    }
}