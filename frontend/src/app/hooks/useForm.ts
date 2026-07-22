import { useState, useCallback, useMemo } from 'react';
import { AppError } from '../lib/errors';

export interface UseFormOptions<T> {
  /** Initial form values */
  initialValues: T;
  /** Validation function that returns errors object */
  validate?: (values: T) => Partial<Record<keyof T, string>>;
  /** Callback when form is submitted successfully */
  onSubmit?: (values: T) => Promise<void> | void;
  /** Callback for any submission error */
  onError?: (error: unknown) => void;
}

export interface FieldProps {
  value: string | number | boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onBlur: () => void;
}

export interface UseFormReturn<T> {
  /** Current form values */
  values: T;
  /** Field validation errors */
  errors: Partial<Record<keyof T, string>>;
  /** Which fields have been touched */
  touched: Partial<Record<keyof T, boolean>>;
  /** Whether form is currently submitting */
  isSubmitting: boolean;
  /** Whether form has been submitted */
  isSubmitted: boolean;
  /** General form error */
  error: AppError | null;
  /** Whether form is valid (no errors) */
  isValid: boolean;
  /** Whether form is dirty (has changes) */
  isDirty: boolean;
  /** Get field props for binding to input elements */
  getFieldProps: (fieldName: keyof T) => FieldProps;
  /** Set a field value */
  setFieldValue: (fieldName: keyof T, value: any) => void;
  /** Set a field error */
  setFieldError: (fieldName: keyof T, error: string) => void;
  /** Mark a field as touched */
  setFieldTouched: (fieldName: keyof T, touched?: boolean) => void;
  /** Get error message for a field (only if touched) */
  getFieldError: (fieldName: keyof T) => string | undefined;
  /** Submit the form */
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  /** Reset form to initial values */
  reset: () => void;
  /** Clear all errors */
  clearErrors: () => void;
  /** Set general form error */
  setError: (error: AppError) => void;
}

/**
 * Hook for managing form state, validation, and submission
 * Handles values, errors, touched fields, and submission state
 *
 * @example
 * ```typescript
 * // Simple form without validation
 * const form = useForm({
 *   initialValues: { email: '', password: '' },
 *   onSubmit: async (values) => await loginAPI.login(values.email, values.password)
 * });
 *
 * return (
 *   <form onSubmit={form.handleSubmit}>
 *     <input {...form.getFieldProps('email')} />
 *     {form.getFieldError('email') && <p>{form.getFieldError('email')}</p>}
 *     <button type="submit" disabled={form.isSubmitting || !form.isValid}>
 *       Login
 *     </button>
 *   </form>
 * );
 *
 * // With validation
 * const form = useForm({
 *   initialValues: { email: '', password: '' },
 *   validate: (values) => {
 *     const errors: Record<string, string> = {};
 *     if (!values.email) errors.email = 'Email is required';
 *     if (values.password.length < 8) errors.password = 'Password must be 8+ chars';
 *     return errors;
 *   },
 *   onSubmit: async (values) => await loginAPI.login(values)
 * });
 * ```
 */
export function useForm<T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit,
  onError,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setErrorState] = useState<AppError | null>(null);

  /**
   * Get field props for input binding
   */
  const getFieldProps = useCallback(
    (fieldName: keyof T): FieldProps => ({
      value: values[fieldName] ?? '',
      onChange: (e) => {
        const { value } = e.target;
        setValues((prev) => ({
          ...prev,
          [fieldName]: value,
        }));
      },
      onBlur: () => {
        setTouched((prev) => ({
          ...prev,
          [fieldName]: true,
        }));
      },
    }),
    [values]
  );

  /**
   * Set a field value manually
   */
  const setFieldValue = useCallback((fieldName: keyof T, value: any) => {
    setValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  }, []);

  /**
   * Set a field error manually
   */
  const setFieldError = useCallback((fieldName: keyof T, errorMsg: string) => {
    setErrors((prev) => ({
      ...prev,
      [fieldName]: errorMsg,
    }));
  }, []);

  /**
   * Mark a field as touched
   */
  const setFieldTouched = useCallback((fieldName: keyof T, isTouched = true) => {
    setTouched((prev) => ({
      ...prev,
      [fieldName]: isTouched,
    }));
  }, []);

  /**
   * Get error message for a field (only if touched)
   */
  const getFieldError = useCallback(
    (fieldName: keyof T): string | undefined => {
      return touched[fieldName] ? errors[fieldName] : undefined;
    },
    [errors, touched]
  );

  /**
   * Validate form
   */
  const validateForm = useCallback((): boolean => {
    if (!validate) return true;

    const newErrors = validate(values);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, validate]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setErrorState(null);

      // Validate
      if (!validateForm()) {
        return;
      }

      // Submit
      if (onSubmit) {
        setIsSubmitting(true);
        try {
          await onSubmit(values);
          setIsSubmitted(true);
        } catch (err) {
          onError?.(err);
          if (err instanceof Error) {
            setErrorState({
              name: 'FormError',
              message: err.message,
              code: 'FORM_SUBMIT_ERROR',
            } as AppError);
          }
        } finally {
          setIsSubmitting(false);
        }
      }
    },
    [values, validateForm, onSubmit, onError]
  );

  /**
   * Reset form to initial values
   */
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitted(false);
    setErrorState(null);
  }, [initialValues]);

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  /**
   * Set general form error
   */
  const setError = useCallback((err: AppError) => {
    setErrorState(err);
  }, []);

  /**
   * Computed: Is form valid?
   */
  const isValid = useMemo(() => {
    if (!validate) return true;
    const newErrors = validate(values);
    return Object.keys(newErrors).length === 0;
  }, [values, validate]);

  /**
   * Computed: Is form dirty (has changes)?
   */
  const isDirty = useMemo(() => {
    return JSON.stringify(values) !== JSON.stringify(initialValues);
  }, [values, initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isSubmitted,
    error,
    isValid,
    isDirty,
    getFieldProps,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    getFieldError,
    handleSubmit,
    reset,
    clearErrors,
    setError,
  };
}
