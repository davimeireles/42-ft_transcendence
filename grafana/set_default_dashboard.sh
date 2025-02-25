#!/bin/bash


# This should be implemented yet to set a default dashboard when Grafana starts
# The script should be run after Grafana starts
# The script should be run in the Grafana container


# Wait for Grafana to start
until curl -s http://localhost:3000/api/health; do
  echo "Waiting for Grafana to start..."
  sleep 2
done

# Set the default home dashboard
curl -X PUT -H "Content-Type: application/json" -d '{
  "homeDashboardUID": "<DASHBOARD_UID>"
}' http://admin:admin@localhost:3000/api/org/preferences