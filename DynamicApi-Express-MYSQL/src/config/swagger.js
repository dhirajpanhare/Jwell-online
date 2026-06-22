const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Dynamic API Express - MysticJewel',
      version: '1.0.0',
      description: 'Complete API for MysticJewel e-commerce platform including authentication, products, cart, orders, and admin operations.',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development Server - Local MySQL Database'
      },
      {
        url: 'http://localhost:8080',
        description: 'Production Server'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token for authenticated requests'
        }
      },
      schemas: {
        DynamicApiExecuteRequest: {
          type: 'object',
          required: ['stringFour'],
          properties: {
            stringOne: {
              type: 'string',
              description: 'Parameter values in key=value format. Multiple parameters separated by stringTwo. Example: p_ProductId=1|p_Category=Mobile',
              nullable: true,
              example: 'p_ProductId=1|p_Category=Electronics',
              default: ''
            },
            stringTwo: {
              type: 'string',
              description: 'Separator between parameters (default: |)',
              default: '|',
              example: '|'
            },
            stringThree: {
              type: 'string',
              description: 'Separator between key and value (default: =)',
              default: '=',
              example: '='
            },
            stringFour: {
              type: 'string',
              description: 'Name of the stored procedure to execute',
              example: 'GetProductById',
              minLength: 1,
              maxLength: 255
            }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'boolean',
              description: 'Whether the request succeeded',
              example: true
            },
            message: {
              type: 'string',
              description: 'Response message describing the result',
              example: 'Success'
            },
            data: {
              type: 'array',
              description: 'Returned data from the procedure (array of objects)',
              items: {
                type: 'object',
                additionalProperties: true
              },
              nullable: true,
              example: [
                {
                  'ProductId': 1,
                  'ProductName': 'Laptop',
                  'Price': 50000
                }
              ]
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error description'
            },
            data: {
              type: 'null',
              example: null
            }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'firstName', 'phoneNumber'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com'
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'Minimum 8 characters with uppercase, lowercase, number, and special character',
              example: 'Password@123'
            },
            firstName: {
              type: 'string',
              example: 'John'
            },
            lastName: {
              type: 'string',
              example: 'Doe'
            },
            phoneNumber: {
              type: 'string',
              description: 'Indian phone number (10 digits, starts with 6-9)',
              example: '9876543210'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['emailOrMobile', 'password'],
          properties: {
            emailOrMobile: {
              type: 'string',
              description: 'User email or mobile number',
              example: 'user@example.com'
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'Password@123'
            }
          }
        },
        OtpVerificationRequest: {
          type: 'object',
          required: ['email', 'otp'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com'
            },
            otp: {
              type: 'string',
              description: '6-digit OTP',
              example: '123456'
            }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Authentication successful'
            },
            data: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                  description: 'JWT token for authenticated requests'
                },
                user: {
                  type: 'object',
                  properties: {
                    userId: { type: 'integer' },
                    email: { type: 'string' },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    phoneNumber: { type: 'string' },
                    role: { type: 'string' }
                  }
                }
              }
            }
          }
        },
        ChangePasswordRequest: {
          type: 'object',
          required: ['oldPassword', 'newPassword'],
          properties: {
            oldPassword: {
              type: 'string',
              format: 'password',
              example: 'OldPassword@123'
            },
            newPassword: {
              type: 'string',
              format: 'password',
              example: 'NewPassword@123'
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/**/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

// Add auth endpoints documentation
swaggerSpec.paths = swaggerSpec.paths || {};

swaggerSpec.paths['/api/v1.0/auth/register'] = {
  post: {
    tags: ['Authentication'],
    summary: 'Register a new user',
    description: 'Create a new user account with email, password, and phone number',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/RegisterRequest' }
        }
      }
    },
    responses: {
      201: {
        description: 'User registered successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                status: { type: 'boolean', example: true },
                message: { type: 'string', example: 'Registration successful' },
                data: {
                  type: 'object',
                  properties: {
                    userId: { type: 'integer' },
                    message: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      },
      400: { description: 'Invalid input or email/phone already exists' },
      500: { description: 'Server error' }
    }
  }
};

swaggerSpec.paths['/api/v1.0/auth/login'] = {
  post: {
    tags: ['Authentication'],
    summary: 'User login',
    description: 'Login with email/mobile and password',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/LoginRequest' }
        }
      }
    },
    responses: {
      200: {
        description: 'Login successful',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/AuthResponse' }
          }
        }
      },
      400: { description: 'Invalid credentials or account locked' },
      500: { description: 'Server error' }
    }
  }
};

swaggerSpec.paths['/api/v1.0/auth/send-otp'] = {
  post: {
    tags: ['Authentication'],
    summary: 'Send OTP',
    description: 'Send email verification OTP to user email',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['email'],
            properties: {
              email: { type: 'string', format: 'email' }
            }
          }
        }
      }
    },
    responses: {
      200: {
        description: 'OTP sent successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                status: { type: 'boolean' },
                message: { type: 'string' }
              }
            }
          }
        }
      },
      400: { description: 'Invalid email or rate limit exceeded' }
    }
  }
};

swaggerSpec.paths['/api/v1.0/auth/verify-email-otp'] = {
  post: {
    tags: ['Authentication'],
    summary: 'Verify email OTP',
    description: 'Verify email with OTP and mark email as verified',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/OtpVerificationRequest' }
        }
      }
    },
    responses: {
      200: {
        description: 'Email verified successfully',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/AuthResponse' }
          }
        }
      },
      400: { description: 'Invalid or expired OTP' }
    }
  }
};

swaggerSpec.paths['/api/v1.0/auth/forgot-password'] = {
  post: {
    tags: ['Authentication'],
    summary: 'Initiate password reset',
    description: 'Send password reset OTP to user email',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['email'],
            properties: {
              email: { type: 'string', format: 'email' }
            }
          }
        }
      }
    },
    responses: {
      200: { description: 'Reset OTP sent' },
      400: { description: 'Email not found' }
    }
  }
};

swaggerSpec.paths['/api/v1.0/auth/verify-reset-otp'] = {
  post: {
    tags: ['Authentication'],
    summary: 'Verify password reset OTP',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/OtpVerificationRequest' }
        }
      }
    },
    responses: {
      200: { description: 'OTP verified successfully' },
      400: { description: 'Invalid or expired OTP' }
    }
  }
};

swaggerSpec.paths['/api/v1.0/auth/reset-password'] = {
  post: {
    tags: ['Authentication'],
    summary: 'Reset password',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['email', 'newPassword'],
            properties: {
              email: { type: 'string', format: 'email' },
              newPassword: { type: 'string', format: 'password' }
            }
          }
        }
      }
    },
    responses: {
      200: { description: 'Password reset successfully' },
      400: { description: 'Invalid email or weak password' }
    }
  }
};

swaggerSpec.paths['/api/v1.0/auth/change-password'] = {
  post: {
    tags: ['Authentication'],
    summary: 'Change password',
    description: 'Change password for authenticated user',
    security: [{ BearerAuth: [] }],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/ChangePasswordRequest' }
        }
      }
    },
    responses: {
      200: { description: 'Password changed successfully' },
      400: { description: 'Invalid password' },
      401: { description: 'Unauthorized' }
    }
  }
};

module.exports = swaggerSpec;
