@REM builds the docker image and runs the container, exposing on localhost:3000 (for Windows environments)

docker build -t noodletop-ws .
docker run -p 3000:3000 noodletop-ws
```