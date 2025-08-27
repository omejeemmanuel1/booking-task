import { createSwaggerSpec } from 'next-swagger-doc';

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Booking App API Documentation',
      version: '1.0',
    },
    security: [],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Login: {
          type: 'object',
          description: 'Schema for user login credentials.',
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User\'s email address',
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'User\'s password',
            },
          },
          required: ['email', 'password'],
        },
        CreateBooking: {
          type: 'object',
          description: 'Schema for creating a new booking.',
          properties: {
            serviceId: {
              type: 'string',
              description: 'The ID of the service being booked.',
            },
            providerId: {
              type: 'string',
              description: 'The ID of the provider offering the service.',
            },
            bookingDate: {
              type: 'string',
              format: 'date-time',
              description: 'The desired date and time for the booking.',
            },
          },
          required: ['serviceId', 'providerId', 'bookingDate'],
        },
        Signup: {
          type: 'object',
          description: 'Schema for user registration.',
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User\'s email address',
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'User\'s password',
            },
            name: {
              type: 'string',
              description: 'User\'s full name',
            },
            type: {
              type: 'string',
              enum: ['CLIENT', 'PROVIDER', 'ADMIN'],
              description: 'Type of user (CLIENT, PROVIDER, or ADMIN)',
            },
          },
          required: ['email', 'password', 'name', 'type'],
        },
        Review: {
          type: 'object',
          description: 'Schema for creating a new review.',
          properties: {
            bookingId: {
              type: 'string',
              description: 'The ID of the booking being reviewed.',
            },
            clientId: {
              type: 'string',
              description: 'The ID of the client writing the review.',
            },
            rating: {
              type: 'integer',
              format: 'int32',
              minimum: 1,
              maximum: 5,
              description: 'The rating given to the booking (1-5 stars).',
            },
            comment: {
              type: 'string',
              description: 'Optional comment for the review.',
            },
          },
          required: ['bookingId', 'clientId', 'rating'],
        },
      },
    }, 
  }, 
  paths: {
    '/api/auth/login': {
      post: {
        summary: 'User login',
        description: 'Authenticates a user and returns a JWT token.',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Login',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Successful login, returns user data and JWT token.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: {
                      type: 'object',
                      description: 'User object (excluding password)',
                    },
                    token: {
                      type: 'string',
                      description: 'JWT authentication token',
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Missing email or password.',
          },
          '401': {
            description: 'Invalid credentials.',
          },
          '500': {
            description: 'Internal server error.',
          },
        },
      },
    },
    '/api/auth/signup': {
      post: {
        summary: 'User registration',
        description: 'Registers a new user with email, password, name, and type.',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Signup',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'User successfully registered, returns user data and JWT token.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: {
                      type: 'object',
                      description: 'Newly created user object (excluding password)',
                    },
                    token: {
                      type: 'string',
                      description: 'JWT authentication token',
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Missing required fields or invalid user type.',
          },
          '409': {
            description: 'User with this email already exists.',
          },
          '500': {
            description: 'Internal server error.',
          },
        },
      },
    },
    '/api/auth/admin-login': {
      post: {
        summary: 'Admin user login',
        description: 'Authenticates an admin user with email and password.',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Login',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Admin user successfully logged in, returns user data and JWT token.',
          },
          '400': {
            description: 'Missing required fields or invalid input.',
          },
          '401': {
            description: 'Invalid credentials or user is not an ADMIN.',
          },
          '500': {
            description: 'Internal server error.',
          },
        },
      },
    },
    '/api/auth/admin-signup': {
      post: {
        summary: 'Admin user registration',
        description: 'Registers a new admin user with email, password, and name. Only accessible by existing ADMIN users.',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Signup',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Admin user successfully registered, returns user data and JWT token.',
          },
          '400': {
            description: 'Missing required fields or invalid input.',
          },
          '403': {
            description: 'Unauthorized - only existing ADMIN users can create new ADMINs.',
          },
          '409': {
            description: 'User with this email already exists.',
          },
          '500': {
            description: 'Internal server error.',
          },
        },
      },
    },
    '/api/reviews': {
      get: {
        summary: 'Get reviews by booking ID',
        description: 'Retrieve a list of reviews for a specific booking ID.',
        tags: ['Reviews'],
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            in: 'query',
            name: 'bookingId',
            schema: {
              type: 'string',
              format: 'uuid',
            },
            required: true,
            description: 'The ID of the booking to retrieve reviews for.',
          },
        ],
        responses: {
          200: {
            description: 'A list of reviews.',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Review',
                  },
                },
              },
            },
          },
          400: {
            description: 'Bad request, e.g., missing bookingId.',
          },
          401: {
            description: 'Unauthorized, no valid token.',
          },
          500: {
            description: 'Internal server error.',
          },
        },
      },
      post: {
        summary: 'Create a new review',
        description: 'Create a new review for a booking.',
        tags: ['Reviews'],
        security: [
          {
            bearerAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Review',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Review created successfully.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Review',
                },
              },
            },
          },
          400: {
            description: 'Invalid input.',
          },
          401: {
            description: 'Unauthorized.',
          },
          500: {
            description: 'Internal server error.',
          },
        },
      },
    },
    '/api/services': {
      get: {
        summary: 'Get all services',
        description: 'Retrieves a list of all available services.',
        tags: ['Services'],
        responses: {
          '200': {
            description: 'A list of services.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    services: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          name: { type: 'string' },
                          description: { type: 'string' },
                          price: { type: 'number' },
                          providerId: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '500': {
            description: 'Internal server error.',
          },
        },
      },
      post: {
        summary: 'Create a new service',
        description: 'Allows Admin to create a new service.',
        tags: ['Services'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'price'],
                properties: {
                  name: { type: 'string', description: 'Name of the service.' },
                  description: { type: 'string', description: 'Description of the service.' },
                  price: { type: 'number', format: 'float', description: 'Price of the service.' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Service created successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    service: {
                      type: 'object',
                      description: 'The newly created service object.',
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Missing required fields.',
          },
          '401': {
            description: 'Unauthorized - User not authenticated or not a provider.',
          },
          '500': {
            description: 'Internal server error.',
          },
        },
      },
    },
    '/api/bookings': {
      get: {
        summary: "Get user's bookings",
        description: 'Retrieves a list of bookings associated with the authenticated user (either as client or provider).',
        tags: ['Bookings'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'A list of bookings.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    bookings: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          clientId: { type: 'string' },
                          serviceId: { type: 'string' },
                          providerId: { type: 'string' },
                          bookingDate: { type: 'string', format: 'date-time' },
                          status: { type: 'string', enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'] },
                          client: {
                            type: 'object',
                            properties: {
                              id: { type: 'string' },
                              name: { type: 'string' },
                              email: { type: 'string' },
                            },
                          },
                          provider: {
                            type: 'object',
                            properties: {
                              id: { type: 'string' },
                              name: { type: 'string' },
                              email: { type: 'string' },
                            },
                          },
                          service: {
                            type: 'object',
                            properties: {
                              id: { type: 'string' },
                              name: { type: 'string' },
                              description: { type: 'string' },
                              price: { type: 'number' },
                              providerId: { type: 'string' },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized - User not authenticated.',
          },
          '500': {
            description: 'Internal server error.',
          },
        },
      },
      post: {
        summary: 'Create a new booking',
        description: 'Allows a client to create a new booking for a service.',
        tags: ['Bookings'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateBooking',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Booking created successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    booking: {
                      type: 'object',
                      description: 'The newly created booking object.',
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Missing required fields.',
          },
          '401': {
            description: 'Unauthorized - User not authenticated or not a client.',
          },
          '500': {
            description: 'Internal server error.',
          },
        },
      },
    },
  },
  apis: ['src/app/api/**/*.ts'],
});
  return spec;
};