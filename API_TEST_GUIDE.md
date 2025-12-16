# API Quick Test Guide

Collection de commandes pour tester rapidement l'API avec curl.

## 🔐 Authentication

### Login
```bash
curl -X POST http://localhost:3600/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@sofibank.cd",
    "password": "Password@123"
  }'
```

**Réponse :**
```json
{
  "status": 200,
  "message": "Connexion réussie",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { ... }
  }
}
```

### Get Profile
```bash
curl -X GET http://localhost:3600/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Change Password
```bash
curl -X POST http://localhost:3600/api/auth/change-password \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "current_password": "Password@123",
    "new_password": "NewPassword@123"
  }'
```

## 👥 Employees

### Get All Employees
```bash
curl -X GET "http://localhost:3600/api/employees?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Employee by ID
```bash
curl -X GET http://localhost:3600/api/employees/EMPLOYEE_UUID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create Employee
```bash
curl -X POST http://localhost:3600/api/employees \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "USER_UUID",
    "employee_number": "EMP007",
    "first_name": "Test",
    "last_name": "Employé",
    "email": "test.employe@sofibank.cd",
    "phone": "+243 970 000 007",
    "hire_date": "2025-01-01",
    "contract_type": "permanent",
    "employment_status": "active"
  }'
```

### Update Employee
```bash
curl -X PUT http://localhost:3600/api/employees/EMPLOYEE_UUID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+243 970 000 999"
  }'
```

### Get Statistics
```bash
curl -X GET http://localhost:3600/api/employees/statistics \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🏖️ Leave Management

### Get Leave Types
```bash
curl -X GET http://localhost:3600/api/leave/types \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get All Leave Requests
```bash
curl -X GET "http://localhost:3600/api/leave/requests?page=1&limit=10&status=pending_supervisor" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create Leave Request
```bash
curl -X POST http://localhost:3600/api/leave/requests \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "employee_id": "EMPLOYEE_UUID",
    "leave_type_id": "LEAVE_TYPE_UUID",
    "start_date": "2025-02-01",
    "end_date": "2025-02-05",
    "total_days": 5,
    "return_date": "2025-02-06",
    "reason": "Vacances"
  }'
```

### Submit Leave Request
```bash
curl -X POST http://localhost:3600/api/leave/requests/REQUEST_UUID/submit \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Approve Leave Request
```bash
curl -X POST http://localhost:3600/api/leave/requests/REQUEST_UUID/process \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "approved",
    "comments": "Approuvé"
  }'
```

### Reject Leave Request
```bash
curl -X POST http://localhost:3600/api/leave/requests/REQUEST_UUID/process \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "rejected",
    "comments": "Rejeté - période de forte activité"
  }'
```

### Get Leave Balance
```bash
curl -X GET "http://localhost:3600/api/leave/balances?employee_id=EMPLOYEE_UUID&year=2025" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Initialize Leave Balances
```bash
curl -X POST http://localhost:3600/api/leave/balances/initialize \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "employee_id": "EMPLOYEE_UUID",
    "year": 2025
  }'
```

## ⏰ Attendance

### Get All Attendance Records
```bash
curl -X GET "http://localhost:3600/api/attendance?page=1&limit=10&employee_id=EMPLOYEE_UUID" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Check In
```bash
curl -X POST http://localhost:3600/api/attendance/check-in \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "employee_id": "EMPLOYEE_UUID"
  }'
```

### Check Out
```bash
curl -X POST http://localhost:3600/api/attendance/check-out \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "employee_id": "EMPLOYEE_UUID"
  }'
```

### Create Attendance Record
```bash
curl -X POST http://localhost:3600/api/attendance \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "employee_id": "EMPLOYEE_UUID",
    "date": "2025-01-15",
    "check_in_time": "08:00:00",
    "check_out_time": "17:00:00",
    "total_hours": 8.0,
    "status": "present"
  }'
```

### Get Attendance Statistics
```bash
curl -X GET "http://localhost:3600/api/attendance/statistics?employee_id=EMPLOYEE_UUID&start_date=2025-01-01&end_date=2025-01-31" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Employee Summary
```bash
curl -X GET "http://localhost:3600/api/attendance/summary?employee_id=EMPLOYEE_UUID&year=2025&month=1" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 💡 Tips

### Save Token to Variable
```bash
# Login et sauvegarder le token
TOKEN=$(curl -s -X POST http://localhost:3600/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sofibank.cd","password":"Password@123"}' \
  | jq -r '.data.token')

echo $TOKEN

# Utiliser le token
curl -X GET http://localhost:3600/api/employees \
  -H "Authorization: Bearer $TOKEN"
```

### Pretty Print JSON (avec jq)
```bash
curl -X GET http://localhost:3600/api/employees \
  -H "Authorization: Bearer $TOKEN" | jq
```

### Check HTTP Status
```bash
curl -i -X GET http://localhost:3600/api/employees \
  -H "Authorization: Bearer $TOKEN"
```

## 📦 Postman Collection

Vous pouvez importer ces requêtes dans Postman :

1. Créer une nouvelle Collection "RH Sofibank API"
2. Créer une variable d'environnement `base_url` = `http://localhost:3600/api`
3. Créer une variable `token` (sera remplie après login)
4. Ajouter un script de test dans Login pour extraire le token :

```javascript
// Test script dans Login request
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("token", response.data.token);
}
```

5. Dans les headers des autres requêtes, utiliser :
   - Key: `Authorization`
   - Value: `Bearer {{token}}`

## 🧪 Tests Automatisés

### Script de test complet
```bash
#!/bin/bash

BASE_URL="http://localhost:3600/api"

# 1. Login
echo "1. Login..."
TOKEN=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sofibank.cd","password":"Password@123"}' \
  | jq -r '.data.token')

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed"
  exit 1
fi
echo "✅ Login successful"

# 2. Get Profile
echo "2. Get Profile..."
curl -s -X GET $BASE_URL/auth/profile \
  -H "Authorization: Bearer $TOKEN" > /dev/null
echo "✅ Profile retrieved"

# 3. Get Employees
echo "3. Get Employees..."
curl -s -X GET $BASE_URL/employees \
  -H "Authorization: Bearer $TOKEN" > /dev/null
echo "✅ Employees retrieved"

# 4. Get Leave Types
echo "4. Get Leave Types..."
curl -s -X GET $BASE_URL/leave/types \
  -H "Authorization: Bearer $TOKEN" > /dev/null
echo "✅ Leave types retrieved"

# 5. Get Attendance
echo "5. Get Attendance..."
curl -s -X GET $BASE_URL/attendance \
  -H "Authorization: Bearer $TOKEN" > /dev/null
echo "✅ Attendance retrieved"

echo ""
echo "🎉 All tests passed!"
```

Sauvegarder dans `test-api.sh` et exécuter :
```bash
chmod +x test-api.sh
./test-api.sh
```

## 🐛 Troubleshooting

### Error: Connection refused
```bash
# Vérifier que l'API tourne
curl http://localhost:3600/api/health
```

### Error: 401 Unauthorized
```bash
# Token invalide ou expiré - reconnecter
```

### Error: 403 Forbidden
```bash
# Permissions insuffisantes - utiliser admin@sofibank.cd
```

## 📚 Ressources

- [API README](./api/README.md)
- [Migration Frontend](./MIGRATION_FRONTEND.md)
- [Postman Documentation](https://learning.postman.com/)
- [curl Documentation](https://curl.se/docs/)
