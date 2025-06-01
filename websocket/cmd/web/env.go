package main

import (
	"fmt"

	"github.com/joho/godotenv"
)

func setupEnvVars() {
	if err := godotenv.Load("../web/.env"); err != nil {
		fmt.Println("Didn't find .env file")
	}
}
