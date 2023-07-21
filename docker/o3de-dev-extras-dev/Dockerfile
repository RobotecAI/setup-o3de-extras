FROM ros:humble-ros-core-jammy

ENV O3DE_VERSION=development
ENV O3DE_EXTRAS_VERSION=development
ENV PROJECT_NAME=WarehouseTest

ENV WORKDIR=/data/workspace
ENV DEBIAN_FRONTEND=noninteractive
ENV LANG=en_US.UTF-8

WORKDIR $WORKDIR

# Setup time zone and locale data (necessary for SSL and HTTPS packages)
RUN apt-get update && DEBIAN_FRONTEND="noninteractive" apt-get -y \
    install \
    tzdata \
    locales \
    keyboard-configuration && rm -rf /var/lib/apt/lists/*

RUN sed -i -e 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen && dpkg-reconfigure --frontend=noninteractive locales && update-locale LANG=en_US.UTF-8

ENV LANG=en_US.UTF-8

# Install necessary dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    apt-utils \
    tzdata \
    locales \
    keyboard-configuration \
    bc \
    bind9-utils \
    binutils \
    ca-certificates \
    clang \
    cmake \
    curl \
    file \
    firewalld \
    git \
    git-lfs \
    jq \
    kbd \
    kmod \
    less \
    lsb-release \
    libglu1-mesa-dev \
    libxcb-xinerama0 \
    libfontconfig1-dev \
    libcurl4-openssl-dev \
    libnvidia-gl-470 \
    libssl-dev \
    libxcb-xkb-dev \
    libxkbcommon-x11-dev \
    libxkbcommon-dev \
    libxcb-xfixes0-dev \
    libxcb-xinput-dev \
    libxcb-xinput0 \
    libpcre2-16-0 \
    lsof \
    net-tools \
    ninja-build \
    pciutils \
    python3-pip \
    software-properties-common \
    sudo \
    tar \
    unzip \
    vim \
    wget \
    xz-utils \
    libffi7 \
    clang-12 \
    mesa-common-dev \
    snapd && \
    rm -rf /var/lib/apt/lists/*

# ROS pacakges
RUN apt-get update && apt-get install -y \
    ros-humble-ackermann-msgs \
    ros-humble-control-toolbox \
    ros-humble-gazebo-msgs \
    ros-humble-joy \
    ros-humble-navigation2 \
    ros-humble-rviz2 \
    ros-humble-tf2-ros \
    ros-humble-urdfdom \
    ros-humble-vision-msgs &&    rm -rf /var/lib/apt/lists/*

# VNC and xvfb
RUN apt-get update -y \
    && apt-get -y install \
    xvfb x11vnc

## Symlink clang version to non-versioned clang and set cc to clang
RUN update-alternatives --install /usr/bin/cc cc /usr/bin/clang 100 && \
    update-alternatives --install /usr/bin/c++ c++ /usr/bin/clang++ 100

ADD https://api.github.com/repos/o3de/o3de/git/refs/heads/${O3DE_VERSION} o3de-version.json

# Install o3de
RUN git clone -b ${O3DE_VERSION} --single-branch https://github.com/o3de/o3de.git && \
    cd o3de && \
    git lfs install && \
    git lfs pull

RUN cd o3de && \
    python/get_python.sh

# Install o3de-extras
ADD https://api.github.com/repos/o3de/o3de-extras/git/refs/heads/${O3DE_EXTRAS_VERSION} o3de-extras-version.json
RUN git clone -b ${O3DE_EXTRAS_VERSION} --single-branch https://github.com/RobotecAI/o3de-extras.git && \
    cd o3de-extras && \
    git lfs install && \
    git lfs pull

RUN echo "deb http://security.ubuntu.com/ubuntu focal-security main" | tee /etc/apt/sources.list.d/focal-security.list && \
    apt-get update && \
    apt-get install libssl1.1 && \
    rm -rf /var/lib/apt/lists/*

# regiester engine and Gems from o3de-extras
WORKDIR ${WORKDIR}
RUN ./o3de/scripts/o3de.sh register --this-engine && \
    ./o3de/scripts/o3de.sh register --gem-path ./o3de-extras/Gems/ROS2 && \
    ./o3de/scripts/o3de.sh register --gem-path ./o3de-extras/Gems/RosRobotSample && \
    ./o3de/scripts/o3de.sh register --gem-path ./o3de-extras/Gems/WarehouseSample

# create in project from template in o3de-extras
RUN ./o3de/scripts/o3de.sh create-project \
    --project-path ${WORKDIR}/${PROJECT_NAME} \
    --template-path ./o3de-extras/Templates/Ros2ProjectTemplate/ -f

WORKDIR ${WORKDIR}/${PROJECT_NAME}

RUN . /opt/ros/humble/setup.sh && \
    cmake -B build/linux -S . -G "Ninja Multi-Config" -DLY_STRIP_DEBUG_SYMBOLS=ON -DLY_DISABLE_TEST_MODULES=OFF

RUN . /opt/ros/humble/setup.sh && \
    cmake --build build/linux --config profile --target ${PROJECT_NAME}.GameLauncher Editor

RUN pip install python-statemachine

WORKDIR $WORKDIR

VOLUME $WORKDIR/o3de-extras

# Extra volume for the user to mount their own repository
RUN mkdir -p $WORKDIR/repository

VOLUME $WORKDIR/repository

ENV RMW_IMPLEMENTATION=rmw_fastrtps_cpp

ENV NVIDIA_VISIBLE_DEVICES all
ENV NVIDIA_DRIVER_CAPABILITIES all