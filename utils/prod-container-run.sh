# create tmux session
tmux new-session -d -s mytmux

# start mongodb
tmux send-keys -t mytmux:0.0 "/usr/bin/mongod --config /etc/mongod.conf" C-m

# start vxsacademy server
# tmux split-window -h -t mytmux:0.0
# tmux send-keys -t mytmux:0.1 "cd vxsacademy && npm start" C-m
