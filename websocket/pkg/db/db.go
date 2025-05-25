package db

import (
	"database/sql"

	_ "github.com/mattn/go-sqlite3"
)

var DB *sql.DB

func InitDB() {
	DB, err := sql.Open("sqlite3", "../local.db")
	if err != nil {
		panic(err)
	}

	DB.SetMaxIdleConns(10)
	DB.SetMaxIdleConns(5)
}
