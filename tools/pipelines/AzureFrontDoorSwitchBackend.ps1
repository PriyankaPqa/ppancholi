<#
  .\AzureFrontDoorSwitchBackend.ps1 -frontDoorResourceGroup "frontdoor-bluegreen-rg" -frontDoorName "frontdoor-blue-green" -frontDoorBackendPoolName "backendpool" -frontDoorUrl "frontdoor-blue-green-demo-app.test.com" -backendStorageBlue "frontdoor-web-blue.azurewebsites.net" -backendStorageGreen "frontdoor-web-green.azurewebsites.net"
#>

param (
    [Parameter(Mandatory)]
    [string]$frontDoorResourceGroup,
    [Parameter(Mandatory)]
    [string]$frontDoorName,
    [Parameter(Mandatory)]
    [string]$frontDoorBackendPoolName,
    [Parameter(Mandatory)]
    [string]$frontDoorUrl,
    [Parameter(Mandatory)]
    [string]$backendBlueHostName,
    [Parameter(Mandatory)]
    [string]$backendGreenHostName,
    [Parameter(Mandatory=$false)]
    [bool]$loginWithServicePrincipal = $false,
    [Parameter(Mandatory=$false)]
    [string]$spUsername = '',
    [Parameter(Mandatory=$false)]
    [string]$spPassword = '',
    [Parameter(Mandatory=$false)]
    [string]$spTenant = ''
)

function ListFrontdoorFrontEnds ()
{
    az network front-door backend-pool backend list --front-door-name $frontDoorName --pool-name $frontDoorBackendPoolName --resource-group $frontDoorResourceGroup -o table
}

if ($loginWithServicePrincipal) {
    Write-Host "Loggin in with Service Principal..."
    az login --service-principal -u $spUsername -p $spPassword --tenant $spTenant
}

#Frontdoor extension currently in preview
az extension add --name front-door

#Find the current web app (blue/green), and set the target release environment
$response = Invoke-WebRequest $frontDoorUrl -UseBasicParsing -Method Head
$currentDeploymentWebApp = If ($response.Headers["active-env"] -like "blue-app") {$backendBlueHostName} Else {$backendGreenHostName}
$targetDeploymentWebApp = If ($response.Headers["active-env"] -like "green-app") {$backendBlueHostName} Else {$backendGreenHostName}
Write-Host "Active-Env: " $response.Headers["active-env"]
Write-Host "Current Backend running: $currentDeploymentWebApp"
Write-Host "Target Backend: $targetDeploymentWebApp"
ListFrontdoorFrontEnds

#Convert Front Door Front Backend Address to Array
$addresses = (az network front-door backend-pool backend list --front-door-name $frontDoorName --pool-name $frontDoorBackendPoolName --resource-group $frontDoorResourceGroup --query '[].{Address:address}' -o tsv)
foreach ($address in $addresses) {
    Write-Host "Front door backend: $address"
}

#Check if target backend needs to be created
$targetaddressindex = $addresses.indexOf($targetDeploymentWebApp)
if ($targetaddressindex -eq -1) {
    Write-Host "Adding frontdoor backend: $targetDeploymentWebApp"
    az network front-door backend-pool backend add --address $targetDeploymentWebApp --front-door-name $frontDoorName --pool-name $frontDoorBackendPoolName --resource-group $frontDoorResourceGroup
    ListFrontdoorFrontEnds
}

#Switch Azure Frontdoor backends between blue and green by removing current backend
Write-Host "Remove current backend if needed..."
$currentBackendAddressindex = $addresses.indexOf($currentDeploymentWebApp)
if ($currentBackendAddressindex -ge 0) {
    $currentBackendAddressIndex = ($addresses.indexOf($currentDeploymentWebApp) + 1) # Refactor to ++
    Write-Host "Current backend address found at index $currentBackendAddressIndex... Removing"
    az network front-door backend-pool backend remove --front-door-name $frontDoorName --index $currentBackendAddressIndex --pool-name $frontDoorBackendPoolName --resource-group $frontDoorResourceGroup -o table
    ListFrontdoorFrontEnds
} else
{
    Write-Host "$currentDeploymentWebApp not found in list of backends to be removed"
}

#Wait for Front Door Load Balancer switch of environments to go live!
$StartTime = $(get-date)
DO
{
    $response = Invoke-WebRequest $frontDoorUrl -UseBasicParsing -Method Head
    $CurrentTime = $(get-date)
    $elapsedTime = $CurrentTime - $StartTime
    $totalSeconds = [math]::floor($elapsedTime.TotalSeconds)
    Write-Host "$totalSeconds..." $response.Headers["active-env"]
    Start-Sleep -s 1
} Until ($response.Headers["active-env"] -like "$targetDeploymentWebApp")
