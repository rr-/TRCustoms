#!/bin/bash
set -e

show_help() {
    echo """
Usage: docker run --rm frontend COMMAND

Commands

dev         : Run a development server
shell       : Start a bash shell
build       : Build the frontend
test        : Run frontend tests
tsc         : Run TypeScript compiler
lint        : Run linters
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
    build)
        npm run build
    ;;
    test)
        npm run test
    ;;
    tsc)
        npm run tsc
    ;;
    lint)
        npm run lint
    ;;
    *)
        show_help
    ;;
esac
