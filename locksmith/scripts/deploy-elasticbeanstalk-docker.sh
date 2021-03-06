application=$1
environment=$2
db_username=$3
db_password=$4
db_name=$5
db_hostname=$6
node_env=$7
is_forked_pr=$8
build_id=$9
message=$10

function check_is_forked_pr()
{
    if [ is_forked_pr = "true" ]; then
        echo "Skipping deployment because this is a pull request from a forked repository."
        exit 0
    fi
}

function check_if_locksmith_changed()
{
    # latest commit
    LATEST_COMMIT=$(git rev-parse HEAD)
    # latest commit where path/to/folder1 was changed
    LAST_LOCKSMITH_COMMIT=$(git log -1 --format=format:%H --full-diff ./locksmith)

    if [ $LAST_LOCKSMITH_COMMIT != $LATEST_COMMIT ];then
      echo "No changes to Locksmith, no need to deploy"
      exit 0
    fi
}

check_is_forked_pr
check_if_locksmith_changed

cd locksmith

eb init ${application} -p docker --region us-east-1

if eb status ${environment}; then
    eb deploy ${environment} --label locksmith-${build_id} --message "${message:0:199}"
else
    eb create ${environment} --envvars DB_USERNAME=${db_username},DB_PASSWORD=${db_password},DB_NAME=${db_name},DB_HOSTNAME=${db_hostname},NODE_ENV=${node_env} --elb-type classic
fi