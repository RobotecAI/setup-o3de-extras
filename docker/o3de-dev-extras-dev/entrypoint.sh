#!/bin/bash
export DISPLAY=:20 

RMW_IMPLEMENTATION=rmw_cyclonedds_cpp
export ROS_LOCALHOST_ONLY=1
export ROS_DOMAIN_ID=17

Xvfb :20 -screen 0 1366x768x16 &

exec "$@"