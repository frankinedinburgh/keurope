package main

import (
	"crypto/rand"
	"fmt"
	"golang.org/x/crypto/bcrypt"
)

type User struct {
	ID        string `json:"id"`
	Email     string `json:"email"`
	CreatedAt string `json:"created_at"`
}

func generateID() string {
	b := make([]byte, 16)
	rand.Read(b)
	return fmt.Sprintf("%x", b)
}

func hashPassword(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", fmt.Errorf("failed to hash password: %w", err)
	}
	return string(hash), nil
}

func verifyPassword(hash, password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func registerUser(email, password string) (*User, error) {
	hash, err := hashPassword(password)
	if err != nil {
		return nil, err
	}

	userID := generateID()
	query := "INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)"
	_, err = db.Exec(query, userID, email, hash)
	if err != nil {
		return nil, fmt.Errorf("failed to register user: %w", err)
	}

	return &User{
		ID:    userID,
		Email: email,
	}, nil
}

func getUserByEmail(email string) (*User, string, error) {
	query := "SELECT id, email, password_hash, created_at FROM users WHERE email = ?"
	var user User
	var passwordHash string

	err := db.QueryRow(query, email).Scan(&user.ID, &user.Email, &passwordHash, &user.CreatedAt)
	if err != nil {
		return nil, "", fmt.Errorf("user not found: %w", err)
	}

	return &user, passwordHash, nil
}

func getUserByID(id string) (*User, error) {
	query := "SELECT id, email, created_at FROM users WHERE id = ?"
	var user User

	err := db.QueryRow(query, id).Scan(&user.ID, &user.Email, &user.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}

	return &user, nil
}
