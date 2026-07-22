package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
)

// ValidationError represents a field validation error
type ValidationError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

// ValidationErrorResponse is the error response for validation failures
type ValidationErrorResponse struct {
	Status string             `json:"status"`
	Error  string             `json:"error"`
	Code   string             `json:"code"`
	Errors []ValidationError  `json:"errors,omitempty"`
}

// ValidateRequest validates a request body against a set of rules
// Returns validation errors if any, otherwise returns nil
func ValidateRequest(body interface{}, rules map[string][]ValidationRule) []ValidationError {
	var errors []ValidationError

	// Get the struct value
	v, ok := body.(map[string]interface{})
	if !ok {
		return errors
	}

	// Validate each field
	for field, fieldRules := range rules {
		value := v[field]

		for _, rule := range fieldRules {
			if err := rule.Validate(value); err != nil {
				errors = append(errors, ValidationError{
					Field:   field,
					Message: err.Error(),
				})
				break // Stop at first error for this field
			}
		}
	}

	return errors
}

// ValidationRule defines a validation rule
type ValidationRule interface {
	Validate(value interface{}) error
}

// RequiredRule validates that a field is not empty
type RequiredRule struct {
	Message string
}

func (r RequiredRule) Validate(value interface{}) error {
	if value == nil {
		return fmt.Errorf(r.Message)
	}

	switch v := value.(type) {
	case string:
		if strings.TrimSpace(v) == "" {
			return fmt.Errorf(r.Message)
		}
	case float64:
		// JSON numbers come as float64
		if v == 0 {
			return fmt.Errorf(r.Message)
		}
	default:
		if value == "" || value == nil {
			return fmt.Errorf(r.Message)
		}
	}

	return nil
}

// EmailRule validates that a field is a valid email
type EmailRule struct {
	Message string
}

func (r EmailRule) Validate(value interface{}) error {
	str, ok := value.(string)
	if !ok {
		return fmt.Errorf(r.Message)
	}

	if !strings.Contains(str, "@") || !strings.Contains(str, ".") {
		return fmt.Errorf(r.Message)
	}

	return nil
}

// MinLengthRule validates minimum string length
type MinLengthRule struct {
	Length  int
	Message string
}

func (r MinLengthRule) Validate(value interface{}) error {
	str, ok := value.(string)
	if !ok {
		return fmt.Errorf(r.Message)
	}

	if len(str) < r.Length {
		return fmt.Errorf(r.Message)
	}

	return nil
}

// MaxLengthRule validates maximum string length
type MaxLengthRule struct {
	Length  int
	Message string
}

func (r MaxLengthRule) Validate(value interface{}) error {
	str, ok := value.(string)
	if !ok {
		return fmt.Errorf(r.Message)
	}

	if len(str) > r.Length {
		return fmt.Errorf(r.Message)
	}

	return nil
}

// MinRule validates minimum numeric value
type MinRule struct {
	Min     float64
	Message string
}

func (r MinRule) Validate(value interface{}) error {
	num, ok := value.(float64)
	if !ok {
		return fmt.Errorf(r.Message)
	}

	if num < r.Min {
		return fmt.Errorf(r.Message)
	}

	return nil
}

// DecodeAndValidate decodes JSON body and validates against rules
func DecodeAndValidate(r *http.Request, rules map[string][]ValidationRule) (map[string]interface{}, []ValidationError, error) {
	var body map[string]interface{}

	// Decode JSON
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		return nil, nil, fmt.Errorf("invalid JSON: %w", err)
	}

	// Validate
	errors := ValidateRequest(body, rules)

	return body, errors, nil
}

// WriteValidationError sends a validation error response
func WriteValidationError(w http.ResponseWriter, errors []ValidationError) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusBadRequest)

	response := ValidationErrorResponse{
		Status: "error",
		Error:  "Validation failed",
		Code:   "VALIDATION_ERROR",
		Errors: errors,
	}

	json.NewEncoder(w).Encode(response)
}

// Validation rule constructors for common cases

func Required(message string) ValidationRule {
	if message == "" {
		message = "This field is required"
	}
	return RequiredRule{Message: message}
}

func Email(message string) ValidationRule {
	if message == "" {
		message = "Please enter a valid email address"
	}
	return EmailRule{Message: message}
}

func MinLength(length int, message string) ValidationRule {
	if message == "" {
		message = fmt.Sprintf("Must be at least %d characters", length)
	}
	return MinLengthRule{Length: length, Message: message}
}

func MaxLength(length int, message string) ValidationRule {
	if message == "" {
		message = fmt.Sprintf("Must be no more than %d characters", length)
	}
	return MaxLengthRule{Length: length, Message: message}
}

func Min(min float64, message string) ValidationRule {
	if message == "" {
		message = fmt.Sprintf("Must be at least %.0f", min)
	}
	return MinRule{Min: min, Message: message}
}
