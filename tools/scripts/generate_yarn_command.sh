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

echo "Current working directory: ${paramCurrentWorkingDir}"

# Command to execute lint, test etc.
paramCommand=$2

echo "Asked for: ${paramCommand}"

# Hold the final command string
finalCommand='';


if [[ "$paramCurrentWorkingDir" == '' ]]
then echo 'You need to specify a working directory. It should correspond to the parameter from the yaml template'; exit 1;
fi

if [[ "$paramCommand" == '' ]]
then echo 'You need to specify a command to carry out. Check if the generated command exists in package.json'; exit 1;
fi

# We always execute the command on registration-lib if it was changed
#if [[ "$affectedPackages" =~ 'libs/registration-lib' ]]
#then finalCommand="yarn registration-lib:${paramCommand} &&"
#fi

## There is an issue with affected so for now we always test registration-lib
finalCommand="yarn registration-lib:${paramCommand} &&"

# If affectedPackages contains apps/benef-app and we are on the benef-app pipeline
#if [[ "$affectedPackages" =~ 'apps/benef-app' ]] && [[ "$paramCurrentWorkingDir" == './apps/benef-app/' ]]
#then finalCommand="${finalCommand} yarn benef-app:${paramCommand}";
#fi

## If we are currently in the build benef-app, it means it was changed to we test it
if [[ "$paramCurrentWorkingDir" == './apps/benef-app/' ]]
then finalCommand="${finalCommand} yarn benef-app:${paramCommand}";
fi

## If we are currently in the build emis-app, it means it was changed to we test it
if [[ "$paramCurrentWorkingDir" == './apps/emis-app/' ]]
then finalCommand="${finalCommand} yarn emis-app:${paramCommand}";
fi


echo "Final command: ${finalCommand}";

# Execute the command
eval $finalCommand;
