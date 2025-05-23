#!/bin/bash

# Configuration
SECURITY_GROUP_ID="sg-01317f8d5acf01a98"
PORT=5432
DESCRIPTION="Temporary PostgreSQL access"
DURATION_HOURS=8  # How long the rule should last
REGION="us-east-2"

# Get current public IP
echo "Fetching your current public IP address..."
CURRENT_IP=$(curl -s https://checkip.amazonaws.com)

if [ -z "$CURRENT_IP" ]; then
  echo "Failed to get your current public IP address. Exiting."
  exit 1
fi

echo "Your current public IP is: $CURRENT_IP"

# Format the expiration date
EXPIRY_DATE=$(date -v+${DURATION_HOURS}H +'%Y-%m-%d %H:%M:%S')
DESC_WITH_EXPIRY="${DESCRIPTION} (Expires: ${EXPIRY_DATE})"

# Check if the IP already exists in security group rules
echo "Checking if your IP already exists in security group rules..."
EXISTING_RULE=$(aws ec2 describe-security-groups \
  --region "$REGION" \
  --group-ids "$SECURITY_GROUP_ID" \
  --query "SecurityGroups[0].IpPermissions[?ToPort==$PORT && FromPort==$PORT && IpProtocol=='tcp'].IpRanges[?CidrIp=='$CURRENT_IP/32']" \
  --output text)

# If the rule exists, remove it first
if [ -n "$EXISTING_RULE" ]; then
  echo "Your IP already exists in the security group. Removing the existing rule..."
  aws ec2 revoke-security-group-ingress \
    --region "$REGION" \
    --group-id "$SECURITY_GROUP_ID" \
    --protocol tcp \
    --port $PORT \
    --cidr "$CURRENT_IP/32"
  
  if [ $? -ne 0 ]; then
    echo "Failed to remove existing rule. Exiting."
    exit 1
  fi
  echo "Existing rule removed successfully."
fi

# Add the rule to security group using ip-permissions format
echo "Adding temporary access rule to security group $SECURITY_GROUP_ID..."
aws ec2 authorize-security-group-ingress \
  --region "$REGION" \
  --group-id "$SECURITY_GROUP_ID" \
  --ip-permissions "[{\"IpProtocol\": \"tcp\", \"FromPort\": $PORT, \"ToPort\": $PORT, \"IpRanges\": [{\"CidrIp\": \"$CURRENT_IP/32\", \"Description\": \"$DESC_WITH_EXPIRY\"}]}]"

if [ $? -eq 0 ]; then
  echo "Successfully added rule."
  echo "This rule grants your IP ($CURRENT_IP) access to port $PORT."
  echo "The rule will need to be manually removed after use."
  
  # Schedule rule removal if at command is available
  if command -v at > /dev/null; then
    echo "Scheduling rule removal in $DURATION_HOURS hours..."
    echo "aws ec2 revoke-security-group-ingress --region $REGION --group-id $SECURITY_GROUP_ID --protocol tcp --port $PORT --cidr $CURRENT_IP/32" | at now + $DURATION_HOURS hours
    echo "Rule will be automatically removed after $DURATION_HOURS hours."
  else
    echo "The 'at' command is not available. You will need to remove the rule manually."
    echo "To remove the rule, run:"
    echo "aws ec2 revoke-security-group-ingress --region $REGION --group-id $SECURITY_GROUP_ID --protocol tcp --port $PORT --cidr $CURRENT_IP/32"
  fi
else
  echo "Failed to add rule to security group."
  echo "Make sure you have the AWS CLI configured with proper credentials and permissions."
fi