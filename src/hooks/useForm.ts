import { useState, useCallback } from 'react';
import { validateEmail, validateRequired } from '@/services/ValidationService';

// -------------------------------------------------------------
// Tipagem genérica para qualquer formulário
// -------------------------------------------------------------
type ValidationFunction<T> = (value: T[keyof T], values: T) => string | null;

interface UseFormOptions<T> {
  initialValues: T;
  validators?: Partial<Record<keyof T, ValidationFunction<T>>>;
  onSubmit?: (values: T) => Promise<void> | void;
}

// -------------------------------------------------------------
// Hook principal
// -------------------------------------------------------------
export function useForm<T extends Record<string, any>>({
  initialValues,
  validators = {},
  onSubmit,
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);

  // -----------------------------------------------------------
  // Alterar valor de um campo
  // -----------------------------------------------------------
  const handleChange = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setValues((prev) => ({ ...prev, [field]: value }));
      setTouched((prev) => ({ ...prev, [field]: true }));

      // Validação instantânea
      const validator = validators[field];
      if (validator) {
        const error = validator(value, values);
        setErrors((prev) => ({ ...prev, [field]: error || undefined }));
      }
    },
    [validators, values],
  );

  // -----------------------------------------------------------
  // Validar todos os campos
  // -----------------------------------------------------------
  const validateAll = useCallback((): boolean => {
    let valid = true;
    const newErrors: Partial<Record<keyof T, string>> = {};

    (Object.keys(values) as (keyof T)[]).forEach((field) => {
      const validator = validators[field];
      if (validator) {
        const error = validator(values[field], values);
        if (error) {
          valid = false;
          newErrors[field] = error;
        }
      }
    });

    setErrors(newErrors);
    return valid;
  }, [validators, values]);

  // -----------------------------------------------------------
  // Submeter formulário
  // -----------------------------------------------------------
  const handleSubmit = useCallback(
    async (event?: any) => {
      if (event?.preventDefault) event.preventDefault();

      const isValid = validateAll();
      if (!isValid) return;

      if (!onSubmit) return;

      try {
        setSubmitting(true);
        await onSubmit(values);
      } catch (e) {
        console.error('Erro ao submeter formulário:', e);
      } finally {
        setSubmitting(false);
      }
    },
    [validateAll, onSubmit, values],
  );

  // -----------------------------------------------------------
  // Resetar formulário
  // -----------------------------------------------------------
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setSubmitting(false);
  }, [initialValues]);

  // -----------------------------------------------------------
  // Helpers rápidos (comuns)
  // -----------------------------------------------------------
  const register = useCallback(
    (field: keyof T) => ({
      value: values[field],
      onChangeText: (text: string) => handleChange(field, text as T[keyof T]),
      onBlur: () => setTouched((prev) => ({ ...prev, [field]: true })),
      error: errors[field],
      touched: touched[field],
    }),
    [values, errors, touched, handleChange],
  );

  // -----------------------------------------------------------
  // Retorno
  // -----------------------------------------------------------
  return {
    values,
    errors,
    touched,
    submitting,
    handleChange,
    handleSubmit,
    resetForm,
    validateAll,
    register,
    setValues,
    setErrors,
    setTouched,
  };
}

// -------------------------------------------------------------
// Exemplo de uso
// -------------------------------------------------------------
// const form = useForm({
//   initialValues: { email: '', name: '' },
//   validators: {
//     email: (v) => (validateEmail(String(v)) ? null : 'E-mail inválido'),
//     name: (v) => (validateRequired(String(v)) ? null : 'Nome é obrigatório'),
//   },
//   onSubmit: async (values) => {
//     console.log('Enviado!', values);
//   },
// });
