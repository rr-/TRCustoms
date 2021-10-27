#!/bin/bash
set -e

show_help() {
    echo """
Usage: docker run --rm frontend COMMAND

Commands

dev         : Run a development server
shell       : Start a bash shell
help        : Show this message
"""
}

case "$1" in
    dev)
        npm start
    ;;
    shell)
        /bin/bash "${@:2}"
    ;;
    *)
        show_help
    ;;
esac
