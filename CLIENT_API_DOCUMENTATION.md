# Client Management API Documentation

Base URL: `/api/v1/clients`

This document describes the client management endpoints for UI integration.

---

## 1. Get All Clients (with Pagination & Search)

GET `/api/v1/clients`

Query Parameters:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search query (searches name, company, email, gst)
- `sortBy` (optional): Sort field (name, company, createdAt, totalInvoices)
- `sortOrder` (optional): asc or desc (default: asc)
- `hasPending` (optional): Filter clients with pending invoices (true/false)

Request:
```
GET /api/v1/clients?page=1&limit=10&search=ABC&sortBy=name&sortOrder=asc
Authorization: Bearer {accessToken}
```

Response (200):
```json
{
  "success": true,
  "data": {
    "clients": [
      {
        "id": "client-uuid-1",
        "name": "ABC Pvt Ltd",
        "company": "ABC Technologies",
        "email": "accounts@abcpvtltd.com",
        "phone": "+91 87654 32109",
        "alternatePhone": "+91 87654 32110",
        "gstNumber": "29AABCU9603R1ZM",
        "panNumber": "AABCU9603R",
        "address": {
          "street": "123 Business Park",
          "city": "Bangalore",
          "state": "Karnataka",
          "zipCode": "560001",
          "country": "India"
        },
        "billingAddress": {
          "street": "123 Business Park",
          "city": "Bangalore",
          "state": "Karnataka",
          "zipCode": "560001",
          "country": "India"
        },
        "shippingAddress": {
          "street": "456 Delivery Center",
          "city": "Bangalore",
          "state": "Karnataka",
          "zipCode": "560002",
          "country": "India"
        },
        "contactPerson": {
          "name": "John Doe",
          "designation": "Finance Manager",
          "email": "john.doe@abcpvtltd.com",
          "phone": "+91 87654 32109"
        },
        "totalInvoices": 12,
        "pendingInvoices": 2,
        "totalAmount": 250000.00,
        "paidAmount": 200000.00,
        "pendingAmount": 50000.00,
        "status": "ACTIVE",
        "notes": "Premium client - priority support",
        "createdAt": "2025-12-01T10:00:00",
        "updatedAt": "2026-01-09T10:30:00"
      }
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 10,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "message": "Clients retrieved successfully",
  "timestamp": "2026-01-09T10:30:00"
}
```

---

## 2. Get Client by ID

GET `/api/v1/clients/{clientId}`

Request:
```
GET /api/v1/clients/client-uuid-1
Authorization: Bearer {accessToken}
```

Response (200):
```json
{
  "success": true,
  "data": {
    "id": "client-uuid-1",
    "name": "ABC Pvt Ltd",
    "company": "ABC Technologies",
    "email": "accounts@abcpvtltd.com",
    "phone": "+91 87654 32109",
    "alternatePhone": "+91 87654 32110",
    "gstNumber": "29AABCU9603R1ZM",
    "panNumber": "AABCU9603R",
    "address": {
      "street": "123 Business Park",
      "city": "Bangalore",
      "state": "Karnataka",
      "zipCode": "560001",
      "country": "India"
    },
    "billingAddress": {
      "street": "123 Business Park",
      "city": "Bangalore",
      "state": "Karnataka",
      "zipCode": "560001",
      "country": "India"
    },
    "shippingAddress": {
      "street": "456 Delivery Center",
      "city": "Bangalore",
      "state": "Karnataka",
      "zipCode": "560002",
      "country": "India"
    },
    "contactPerson": {
      "name": "John Doe",
      "designation": "Finance Manager",
      "email": "john.doe@abcpvtltd.com",
      "phone": "+91 87654 32109"
    },
    "totalInvoices": 12,
    "pendingInvoices": 2,
    "totalAmount": 250000.00,
    "paidAmount": 200000.00,
    "pendingAmount": 50000.00,
    "status": "ACTIVE",
    "notes": "Premium client - priority support",
    "createdAt": "2025-12-01T10:00:00",
    "updatedAt": "2026-01-09T10:30:00"
  },
  "message": "Client retrieved successfully",
  "timestamp": "2026-01-09T10:30:00"
}
```

---

## 3. Create Client

POST `/api/v1/clients`

Request Body:
```json
{
  "name": "ABC Pvt Ltd",
  "company": "ABC Technologies",
  "email": "accounts@abcpvtltd.com",
  "phone": "+91 87654 32109",
  "alternatePhone": "+91 87654 32110",
  "gstNumber": "29AABCU9603R1ZM",
  "panNumber": "AABCU9603R",
  "address": {
    "street": "123 Business Park",
    "city": "Bangalore",
    "state": "Karnataka",
    "zipCode": "560001",
    "country": "India"
  },
  "billingAddress": {
    "street": "123 Business Park",
    "city": "Bangalore",
    "state": "Karnataka",
    "zipCode": "560001",
    "country": "India"
  },
  "shippingAddress": {
    "street": "456 Delivery Center",
    "city": "Bangalore",
    "state": "Karnataka",
    "zipCode": "560002",
    "country": "India"
  },
  "contactPerson": {
    "name": "John Doe",
    "designation": "Finance Manager",
    "email": "john.doe@abcpvtltd.com",
    "phone": "+91 87654 32109"
  },
  "notes": "Premium client - priority support",
  "status": "ACTIVE"
}
```

Response (201):
```json
{
  "success": true,
  "data": {
    "id": "client-uuid-1",
    "name": "ABC Pvt Ltd",
    "company": "ABC Technologies",
    "email": "accounts@abcpvtltd.com",
    "phone": "+91 87654 32109",
    "alternatePhone": "+91 87654 32110",
    "gstNumber": "29AABCU9603R1ZM",
    "panNumber": "AABCU9603R",
    "address": {
      "street": "123 Business Park",
      "city": "Bangalore",
      "state": "Karnataka",
      "zipCode": "560001",
      "country": "India"
    },
    "billingAddress": {
      "street": "123 Business Park",
      "city": "Bangalore",
      "state": "Karnataka",
      "zipCode": "560001",
      "country": "India"
    },
    "shippingAddress": {
      "street": "456 Delivery Center",
      "city": "Bangalore",
      "state": "Karnataka",
      "zipCode": "560002",
      "country": "India"
    },
    "contactPerson": {
      "name": "John Doe",
      "designation": "Finance Manager",
      "email": "john.doe@abcpvtltd.com",
      "phone": "+91 87654 32109"
    },
    "totalInvoices": 0,
    "pendingInvoices": 0,
    "totalAmount": 0.00,
    "paidAmount": 0.00,
    "pendingAmount": 0.00,
    "status": "ACTIVE",
    "notes": "Premium client - priority support",
    "createdAt": "2026-01-09T10:30:00",
    "updatedAt": "2026-01-09T10:30:00"
  },
  "message": "Client created successfully",
  "timestamp": "2026-01-09T10:30:00"
}
```

---

## 4. Update Client

PUT `/api/v1/clients/{clientId}`

Request Body (partial update supported):
```json
{
  "name": "ABC Pvt Ltd Updated",
  "phone": "+91 87654 32200",
  "notes": "Updated notes",
  "status": "ACTIVE"
}
```

Response (200):
```json
{
  "success": true,
  "data": {
    "id": "client-uuid-1",
    "name": "ABC Pvt Ltd Updated",
    "company": "ABC Technologies",
    "email": "accounts@abcpvtltd.com",
    "phone": "+91 87654 32200",
    "alternatePhone": "+91 87654 32110",
    "gstNumber": "29AABCU9603R1ZM",
    "panNumber": "AABCU9603R",
    "address": {
      "street": "123 Business Park",
      "city": "Bangalore",
      "state": "Karnataka",
      "zipCode": "560001",
      "country": "India"
    },
    "billingAddress": {
      "street": "123 Business Park",
      "city": "Bangalore",
      "state": "Karnataka",
      "zipCode": "560001",
      "country": "India"
    },
    "shippingAddress": {
      "street": "456 Delivery Center",
      "city": "Bangalore",
      "state": "Karnataka",
      "zipCode": "560002",
      "country": "India"
    },
    "contactPerson": {
      "name": "John Doe",
      "designation": "Finance Manager",
      "email": "john.doe@abcpvtltd.com",
      "phone": "+91 87654 32109"
    },
    "totalInvoices": 12,
    "pendingInvoices": 2,
    "totalAmount": 250000.00,
    "paidAmount": 200000.00,
    "pendingAmount": 50000.00,
    "status": "ACTIVE",
    "notes": "Updated notes",
    "createdAt": "2025-12-01T10:00:00",
    "updatedAt": "2026-01-09T11:00:00"
  },
  "message": "Client updated successfully",
  "timestamp": "2026-01-09T11:00:00"
}
```

---

## 5. Delete Client

DELETE `/api/v1/clients/{clientId}`

Request:
```
DELETE /api/v1/clients/client-uuid-1
Authorization: Bearer {accessToken}
```

Response (200):
```json
{
  "success": true,
  "data": null,
  "message": "Client deleted successfully",
  "timestamp": "2026-01-09T10:30:00"
}
```

Note: If client has associated invoices, you may want to:
- Soft delete (set status to DELETED)
- Return error if has pending invoices
- Archive instead of delete

---

## 6. Get Client Statistics

GET `/api/v1/clients/{clientId}/statistics`

Request:
```
GET /api/v1/clients/client-uuid-1/statistics
Authorization: Bearer {accessToken}
```

Response (200):
```json
{
  "success": true,
  "data": {
    "totalInvoices": 12,
    "pendingInvoices": 2,
    "completedInvoices": 10,
    "totalAmount": 250000.00,
    "paidAmount": 200000.00,
    "pendingAmount": 50000.00,
    "overdueAmount": 25000.00,
    "averageInvoiceAmount": 20833.33,
    "lastInvoiceDate": "2026-01-05T10:00:00",
    "firstInvoiceDate": "2025-12-01T10:00:00",
    "paymentHistory": [
      {
        "month": "2025-12",
        "invoices": 8,
        "amount": 150000.00,
        "paid": 150000.00
      },
      {
        "month": "2026-01",
        "invoices": 4,
        "amount": 100000.00,
        "paid": 50000.00
      }
    ]
  },
  "message": "Client statistics retrieved successfully",
  "timestamp": "2026-01-09T10:30:00"
}
```

---

## 7. Get Client Invoices

GET `/api/v1/clients/{clientId}/invoices`

Query Parameters:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by invoice status (DRAFT, SENT, PAID, OVERDUE, CANCELLED)

Request:
```
GET /api/v1/clients/client-uuid-1/invoices?page=1&limit=10&status=PENDING
Authorization: Bearer {accessToken}
```

Response (200):
```json
{
  "success": true,
  "data": {
    "invoices": [
      {
        "id": "invoice-uuid-1",
        "invoiceNumber": "INV-2026-001",
        "clientId": "client-uuid-1",
        "clientName": "ABC Pvt Ltd",
        "amount": 25000.00,
        "paidAmount": 0.00,
        "status": "PENDING",
        "dueDate": "2026-01-15T00:00:00",
        "issueDate": "2026-01-05T10:00:00",
        "createdAt": "2026-01-05T10:00:00"
      }
    ],
    "pagination": {
      "total": 12,
      "page": 1,
      "limit": 10,
      "totalPages": 2,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "message": "Client invoices retrieved successfully",
  "timestamp": "2026-01-09T10:30:00"
}
```

---

## 8. Bulk Import Clients

POST `/api/v1/clients/bulk-import`

Request Body (CSV or JSON array):
```json
{
  "clients": [
    {
      "name": "Client 1",
      "company": "Company 1",
      "email": "client1@example.com",
      "phone": "+91 1234567890",
      "gstNumber": "29AABCU9603R1ZM"
    },
    {
      "name": "Client 2",
      "company": "Company 2",
      "email": "client2@example.com",
      "phone": "+91 1234567891",
      "gstNumber": "27AABCU9603R1ZM"
    }
  ]
}
```

Response (200):
```json
{
  "success": true,
  "data": {
    "imported": 2,
    "failed": 0,
    "errors": [],
    "clients": [
      {
        "id": "client-uuid-1",
        "name": "Client 1",
        "email": "client1@example.com"
      },
      {
        "id": "client-uuid-2",
        "name": "Client 2",
        "email": "client2@example.com"
      }
    ]
  },
  "message": "Clients imported successfully",
  "timestamp": "2026-01-09T10:30:00"
}
```

---

## 9. Export Clients

GET `/api/v1/clients/export`

Query Parameters:
- `format` (optional): csv or pdf (default: csv)
- `filters` (optional): JSON string with filter criteria

Request:
```
GET /api/v1/clients/export?format=csv
Authorization: Bearer {accessToken}
```

Response (200):
- Returns file download (CSV or PDF)
- Content-Type: text/csv or application/pdf
- Content-Disposition: attachment; filename="clients-2026-01-09.csv"

---

## 10. Search Clients (Advanced)

POST `/api/v1/clients/search`

Request Body:
```json
{
  "query": "ABC",
  "filters": {
    "status": ["ACTIVE"],
    "hasPending": true,
    "states": ["Karnataka", "Tamil Nadu"],
    "minInvoices": 5,
    "maxInvoices": 20
  },
  "page": 1,
  "limit": 10,
  "sortBy": "name",
  "sortOrder": "asc"
}
```

Response (200):
```json
{
  "success": true,
  "data": {
    "clients": [
      {
        "id": "client-uuid-1",
        "name": "ABC Pvt Ltd",
        "company": "ABC Technologies",
        "email": "accounts@abcpvtltd.com",
        "phone": "+91 87654 32109",
        "gstNumber": "29AABCU9603R1ZM",
        "totalInvoices": 12,
        "pendingInvoices": 2,
        "status": "ACTIVE"
      }
    ],
    "pagination": {
      "total": 5,
      "page": 1,
      "limit": 10,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  },
  "message": "Search results retrieved successfully",
  "timestamp": "2026-01-09T10:30:00"
}
```

---

## 11. Update Client Status

PATCH `/api/v1/clients/{clientId}/status`

Request Body:
```json
{
  "status": "INACTIVE"
}
```

Status values:
- ACTIVE
- INACTIVE
- SUSPENDED
- DELETED

Response (200):
```json
{
  "success": true,
  "data": {
    "id": "client-uuid-1",
    "status": "INACTIVE",
    "updatedAt": "2026-01-09T10:30:00"
  },
  "message": "Client status updated successfully",
  "timestamp": "2026-01-09T10:30:00"
}
```

---

## 12. Get Client Dashboard Summary

GET `/api/v1/clients/summary`

Request:
```
GET /api/v1/clients/summary
Authorization: Bearer {accessToken}
```

Response (200):
```json
{
  "success": true,
  "data": {
    "totalClients": 45,
    "activeClients": 40,
    "inactiveClients": 5,
    "clientsWithPending": 12,
    "totalRevenue": 2500000.00,
    "pendingRevenue": 350000.00,
    "topClients": [
      {
        "id": "client-uuid-5",
        "name": "Global Inc",
        "totalAmount": 500000.00,
        "totalInvoices": 20
      }
    ],
    "recentClients": [
      {
        "id": "client-uuid-1",
        "name": "ABC Pvt Ltd",
        "createdAt": "2026-01-05T10:00:00"
      }
    ],
    "clientsByState": {
      "Karnataka": 15,
      "Tamil Nadu": 12,
      "Maharashtra": 10,
      "Delhi": 8
    }
  },
  "message": "Client summary retrieved successfully",
  "timestamp": "2026-01-09T10:30:00"
}
```

---

## Common Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "data": null,
  "message": "Invalid GST number format",
  "errors": [
    {
      "field": "gstNumber",
      "message": "GST number must be 15 characters"
    }
  ],
  "timestamp": "2026-01-09T10:30:00"
}
```

### 404 Not Found
```json
{
  "success": false,
  "data": null,
  "message": "Client not found",
  "timestamp": "2026-01-09T10:30:00"
}
```

### 409 Conflict
```json
{
  "success": false,
  "data": null,
  "message": "Client with this email already exists",
  "timestamp": "2026-01-09T10:30:00"
}
```

---

## Field Validation Rules

### Required Fields (Create):
- name
- company
- email
- phone
- address.city
- address.state
- address.country

### Optional Fields:
- alternatePhone
- gstNumber
- panNumber
- billingAddress (defaults to address)
- shippingAddress (defaults to address)
- contactPerson
- notes
- status (defaults to ACTIVE)

### Email Validation:
- Must be valid email format
- Must be unique across all clients

### Phone Validation:
- Must be valid phone number format
- Support for international formats

### GST Validation:
- Must be 15 characters
- Format: 2 digits (state) + 10 alphanumeric (PAN) + 1 digit + 1 alphanumeric + 1 alphanumeric

---

## UI Integration Tips

1. **Search**: Implement debounced search with 300ms delay
2. **Pagination**: Load 10-20 clients per page for optimal performance
3. **Filters**: Allow multiple filter combinations
4. **Sort**: Support sorting by name, company, totalInvoices, createdAt
5. **Status Badge**: Use color coding for different statuses
6. **Actions**: Implement view, edit, delete with confirmation dialogs
7. **Bulk Operations**: Support multi-select for bulk status updates
8. **Export**: Provide CSV/PDF export functionality
9. **Import**: Support CSV file upload with validation

---

## Voice Integration Suggestions

**Voice Commands:**
- "Add client" → Open create client dialog
- "Show clients with pending invoices" → Filter by hasPending=true
- "Search [client name]" → Set search query
- "Export clients" → Trigger export
- "Show top clients" → Navigate to dashboard summary

---

Generated by system on 2026-01-09
