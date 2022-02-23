# This script is an helper to generate commands on specific packages
# For now we always want to test or lint registration-lib if changed
# We want to do the same for each app only if the current pipeline is corresponding to the app itself

# Examples
# yarn registration-lib:test && yarn benef-app:test
# yarn benef-app:test
# yarn emis-app:lint


# Get a list of affected packages
affectedPackages=$(yarn affected)

# Current working directory coming from the pipeline (benef-app or emis-app)
paramCurrentWorkingDir=$1

# Command to execute lint, test etc.
paramCommand=$2

# Hold the final command string
finalCommand='';


if [[ "$paramCurrentWorkingDir" == '' ]]
then echo 'You need to specify a working directory. It should correspond to the parameter from the yaml template'; exit;
fi

if [[ "$paramCommand" == '' ]]
then echo 'You need to specify a command to carry out. Check if the generated command exists in package.json'; exit;
fi



# We always execute the command on registration-lib if it was changed
if [[ "$affectedPackages" =~ 'libs/registration-lib' ]]
then finalCommand="yarn registration-lib:${paramCommand} &&"
fi

# If affectedPackages contains apps/benef-app and we are on the benef-app pipeline
if [[ "$affectedPackages" =~ 'apps/benef-app' ]] && [[ "$paramCurrentWorkingDir" == './apps/benef-app/' ]]
then finalCommand="${finalCommand} yarn benef-app:${paramCommand}";
fi

# If affectedPackages contains apps/emis-app and we are on the emis-app pipeline
if [[ "$affectedPackages" =~ 'apps/emis-app' ]]  && [[ "$paramCurrentWorkingDir" == './apps/emis-app/' ]]
then finalCommand="${finalCommand} yarn emis-app:${paramCommand}";
fi

# Execute the command
eval $finalCommand;
