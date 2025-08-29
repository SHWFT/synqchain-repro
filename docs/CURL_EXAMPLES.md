# SynqChain MVP API - cURL Examples

This document provides cURL examples for all major API endpoints.

## Base URL

```bash
export API_BASE="http://localhost:4000"
```

## Authentication

### Register User

```bash
curl -X POST $API_BASE/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'
```

### Login (Demo User)

```bash
curl -X POST $API_BASE/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "demo@demo.com",
    "password": "demo"
  }'
```

### Get Current User

```bash
curl -X GET $API_BASE/auth/me \
  -b cookies.txt
```

### Logout

```bash
curl -X POST $API_BASE/auth/logout \
  -b cookies.txt
```

## Suppliers

### Get All Suppliers

```bash
curl -X GET "$API_BASE/suppliers?search=&page=1&limit=10" \
  -b cookies.txt
```

### Create Supplier

```bash
curl -X POST $API_BASE/suppliers \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Acme Corp",
    "category": "Manufacturing",
    "location": "New York, NY",
    "contact": "John Smith",
    "phone": "+1-555-0123",
    "website": "https://acme-corp.com",
    "notes": "Reliable supplier for industrial components"
  }'
```

### Get Supplier by ID

```bash
curl -X GET $API_BASE/suppliers/SUPPLIER_ID \
  -b cookies.txt
```

### Update Supplier

```bash
curl -X PUT $API_BASE/suppliers/SUPPLIER_ID \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Acme Corporation",
    "category": "Advanced Manufacturing",
    "notes": "Updated supplier information"
  }'
```

### Delete Supplier

```bash
curl -X DELETE $API_BASE/suppliers/SUPPLIER_ID \
  -b cookies.txt
```

## Projects

### Get All Projects

```bash
curl -X GET "$API_BASE/projects?search=&status=&page=1&limit=10" \
  -b cookies.txt
```

### Create Project

```bash
curl -X POST $API_BASE/projects \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Supply Chain Optimization",
    "description": "Streamline procurement processes and reduce costs",
    "client": "Manufacturing Corp",
    "priority": "High",
    "savingsTarget": 150000,
    "startDate": "2024-01-15T00:00:00.000Z",
    "dueDate": "2024-06-30T00:00:00.000Z",
    "status": "In Progress"
  }'
```

### Get Project by ID

```bash
curl -X GET $API_BASE/projects/PROJECT_ID \
  -b cookies.txt
```

### Update Project

```bash
curl -X PUT $API_BASE/projects/PROJECT_ID \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "status": "Completed"
  }'
```

### Delete Project

```bash
curl -X DELETE $API_BASE/projects/PROJECT_ID \
  -b cookies.txt
```

## Purchase Orders

### Get All Purchase Orders

```bash
curl -X GET "$API_BASE/po?status=&supplierId=&page=1&limit=10" \
  -b cookies.txt
```

### Create Purchase Order

```bash
curl -X POST $API_BASE/po \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "number": "PO-2024-001",
    "supplierId": "SUPPLIER_ID",
    "total": 25000.00,
    "currency": "USD"
  }'
```

### Get Purchase Order by ID

```bash
curl -X GET $API_BASE/po/PO_ID \
  -b cookies.txt
```

### Update Purchase Order

```bash
curl -X PUT $API_BASE/po/PO_ID \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "total": 27500.00
  }'
```

### Submit Purchase Order for Approval

```bash
curl -X POST $API_BASE/po/PO_ID/submit \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "notes": "Ready for approval - all items verified"
  }'
```

### Approve Purchase Order

```bash
curl -X POST $API_BASE/po/PO_ID/approve \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "notes": "Approved by finance team"
  }'
```

### Get Purchase Order Events (Timeline)

```bash
curl -X GET "$API_BASE/po/PO_ID/events?page=1&limit=20" \
  -b cookies.txt
```

### Delete Purchase Order

```bash
curl -X DELETE $API_BASE/po/PO_ID \
  -b cookies.txt
```

## File Management

### Upload File to Purchase Order

```bash
curl -X POST $API_BASE/files/upload \
  -b cookies.txt \
  -F "file=@/path/to/document.pdf" \
  -F "entityType=po" \
  -F "entityId=PO_ID"
```

### Download File

```bash
curl -X GET $API_BASE/files/FILE_ID \
  -b cookies.txt \
  -o downloaded_file.pdf
```

### Get Files by Entity

```bash
curl -X GET $API_BASE/files/entity/po/PO_ID \
  -b cookies.txt
```

### Delete File

```bash
curl -X DELETE $API_BASE/files/FILE_ID \
  -b cookies.txt
```

## Analytics

### Get KPIs and Dashboard Data

```bash
curl -X GET "$API_BASE/analytics/kpis?start=2024-01-01&end=2024-12-31" \
  -b cookies.txt
```

### Get KPIs for Current Year

```bash
curl -X GET $API_BASE/analytics/kpis \
  -b cookies.txt
```

## Health Check

### API Health Status

```bash
curl -X GET $API_BASE/healthz
```

## Common Response Patterns

### Success Response (200)

```json
{
  "id": "clxxxxx",
  "name": "Example Resource",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### Error Response (400/401/404/500)

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "details": {
    "email": ["email must be a valid email address"]
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/auth/register"
}
```

### Paginated Response

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Authentication Notes

1. **Cookies**: The API uses HTTP-only cookies for authentication. Use `-c cookies.txt` to save cookies and `-b cookies.txt` to send them.

2. **CSRF Protection**: Not implemented in this MVP, but may be added in future versions.

3. **Rate Limiting**:
   - General API: 100 requests/minute
   - Auth endpoints: 5 requests/minute
   - File uploads: 10 requests/minute

## Error Handling

Common HTTP status codes:

- `200` - Success
- `201` - Created
- `204` - No Content (successful deletion)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## Environment Variables

For production use, update the base URL:

```bash
# Development
export API_BASE="http://localhost:4000"

# Production
export API_BASE="https://your-production-api.com"
```

## Testing Workflow

1. **Login** to get authentication cookie
2. **Create** resources (suppliers, projects)
3. **Create** purchase orders linking to suppliers
4. **Submit/Approve** purchase orders to test workflow
5. **Upload** files and associate with entities
6. **View** analytics to see aggregated data
7. **Logout** to end session

## Bulk Operations

For testing multiple records, you can use shell loops:

```bash
# Create multiple suppliers
for i in {1..5}; do
  curl -X POST $API_BASE/suppliers \
    -H "Content-Type: application/json" \
    -b cookies.txt \
    -d "{
      \"name\": \"Supplier $i\",
      \"category\": \"Category $i\",
      \"location\": \"Location $i\"
    }"
done
```
