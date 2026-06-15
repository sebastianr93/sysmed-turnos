package com.medical.appointment.exception;

import com.medical.appointment.dto.response.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(
            ResourceNotFoundException ex, HttpServletRequest request) {
        log.warn("Resource not found: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(buildError(HttpStatus.NOT_FOUND, "Recurso No Encontrado", ex.getMessage(), request));
    }

    @ExceptionHandler(BusinessRuleException.class)
    public ResponseEntity<ErrorResponse> handleBusinessRule(
            BusinessRuleException ex, HttpServletRequest request) {
        log.warn("Business rule violation: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(buildError(HttpStatus.BAD_REQUEST, "Violación de Regla de Negocio", ex.getMessage(), request));
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ErrorResponse> handleDuplicate(
            DuplicateResourceException ex, HttpServletRequest request) {
        log.warn("Duplicate resource: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(buildError(HttpStatus.CONFLICT, "Recurso Duplicado", ex.getMessage(), request));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(
            AccessDeniedException ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(buildError(HttpStatus.FORBIDDEN, "Acceso Denegado",
                        "No tiene permisos para realizar esta acción", request));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(
            BadCredentialsException ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(buildError(HttpStatus.UNAUTHORIZED, "Credenciales Inválidas",
                        "Email o contraseña incorrectos", request));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(
            MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        ErrorResponse response = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Error de Validación")
                .message("Hay errores en los datos enviados")
                .path(request.getRequestURI())
                .validationErrors(errors)
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(
            Exception ex, HttpServletRequest request) {
        log.error("Unexpected error: ", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(buildError(HttpStatus.INTERNAL_SERVER_ERROR, "Error Interno",
                        "Ocurrió un error inesperado", request));
    }

    private ErrorResponse buildError(HttpStatus status, String error, String message, HttpServletRequest request) {
        return ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(status.value())
                .error(error)
                .message(message)
                .path(request.getRequestURI())
                .build();
    }
}
