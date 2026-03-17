#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate

# Create superuser automatically if it doesn't exist
python manage.py shell << 'EOF'
from django.contrib.auth import get_user_model
User = get_user_model()
email = 'suresh1234bathina@gmail.com'
password = 'Admin@1234'
if not User.objects.filter(email=email).exists():
    User.objects.create_superuser(email=email, full_name='Admin', password=password)
    print(f'Superuser {email} created successfully')
else:
    print(f'Superuser {email} already exists')
EOF