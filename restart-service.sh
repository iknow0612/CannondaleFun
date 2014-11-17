#!/bin/sh

checkProcess(){
        processNum=`screen -ls | grep 'CF' | wc -l`;
        if [ $processNum -eq 1  ] ;
        then
                return 0;
        else
                return 1;
        fi;
}

while [ 1 ] 
do
        checkProcess ;
        if [ $? -eq 1 ] ;
        then
                echo start
                screen -S CF nodejs ./bin/www
        fi;
        sleep 5;
done
