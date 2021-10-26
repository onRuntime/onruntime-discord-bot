#!/bin/bash
 
GCP_CONFIGURATION_NAME=bearit
GCP_PROJECT_NAME=discord-bot
GCP_REGION=europe-west
 
if [ -z "$1" ]
then
    ENVSUFFIX="test"
else
    ENVSUFFIX=$1
fi
 
# Ensure proper GCP configuration is set
gcloud config configurations activate ${GCP_CONFIGURATION_NAME}
 
rm data/auth.json
cp data/auth-"${ENVSUFFIX}".json data/auth.json
 
docker build --no-cache -t eu.gcr.io/${GCP_PROJECT_NAME}/onruntime-"${ENVSUFFIX}" .
docker push eu.gcr.io/${GCP_PROJECT_NAME}/onruntime-"${ENVSUFFIX}"
 
echo "Deploy new revision of onruntime-${ENVSUFFIX}"
 
gcloud run deploy onruntime-"${ENVSUFFIX}" --image=eu.gcr.io/${GCP_PROJECT_NAME}/onruntime-"${ENVSUFFIX}" \
  --platform=managed --region=${GCP_REGION} --allow-unauthenticated \
  --max-instances 1 --memory=512Mi
 
echo "Ensure that there is cron job for checking onruntime-${ENVSUFFIX}"
 
# Get proper URL
GCP_APP_URL=$(gcloud run services list --platform=managed --region=${GCP_REGION} \
  --filter="status.address.url ~ onruntime-${ENVSUFFIX}" \
  --format="value(status.address.url)")
 
gcloud scheduler jobs create http GET-onruntimebot-"${ENVSUFFIX}" \
  --schedule="* * * * *" --uri="${GCP_APP_URL}" --http-method GET