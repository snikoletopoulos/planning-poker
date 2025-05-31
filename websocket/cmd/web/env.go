package main

import "github.com/joho/godotenv"

func setupEnvVars() {
	if err := godotenv.Load("../web/.env"); err != nil {
		panic("Error loading .env file")
	}
}
