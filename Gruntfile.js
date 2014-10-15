module.exports = function (grunt) {

    var fs = require("fs");
    grunt.initConfig({
            pkg: grunt.file.readJSON("./package.json"),
            copy: {
                all: {
                    //cwd: "./views_src/",
                    cwd: "./views_empty/",
                    src: [ "./**" ],
                    dest: "./views/",
                    expand: true
                }
            },
            uglify: {
                options: {
                    banner: "/*! <%= pkg.name %> <%= grunt.template.today('yyyy-mm-dd h:MM:ss TT') %> */\n"
                },
                libJs: {
                    src: "./public/dist/js/jquery-bootstrap.js",
                    dest: "./public/dist/js/jquery-bootstrap.js",
                    options: {
                        sourceMap: true,
                        sourceMapName: "./public/dist/js/jquery-bootstrap.js.map"
                    }
                }
            },
            cssmin: {
                options: {
                    keepSpecialComments: 0
                },
                css: {
                    src: "./public/dist/css/app.css",
                    dest: "./public/dist/css/app.css"
                },
                cssLib: {
                    src: "./public/dist/css/bootstrap-sbadmin-font-awesome.css",
                    dest: "./public/dist/css/bootstrap-sbadmin-font-awesome.css"
                }
            },
            concat: {
                options: {
                    noncmd: true
                },
                js: {
                    files: [
                        {
                            src: [
                                "./public/bower_components/jquery/dist/jquery.min.js",
                                "./public/bower_components/bootstrap/dist/js/bootstrap.min.js"
                            ],
                            dest: "./public/dist/js/jquery-bootstrap.js"
                        }
                    ]
                },
                cssLib: {
                    files: [
                        {
                            src: [
                                "./public/bower_components/bootstrap/dist/css/bootstrap.css",
                                "./public/bower_components/sb-admin-v2/css/sb-admin-2.css",
                                "./public/bower_components/bower_components/font-awesome/css/font-awesome.min.css",
                            ],
                            dest: "./public/dist/css/bootstrap-sbadmin-font-awesome.css"
                        }
                    ]
                },
                css: {
                    files: [
                        {
                            src: [
                                "./public/stylesheets/sticky-footer-navbar.css",
                                "./public/stylesheets/signin.css",
                            ],
                            dest: "./public/dist/css/app.css"
                        }
                    ]
                }
            },
            replace: {
                "views": {
                    file: "./views/layout.jade",
                    replace: [
                        '/dist/css/bootstrap-sbadmin-font-awesome.css',
                        '/dist/css/app.css',
                        '/dist/js/jquery-bootstrap.js'
                   ]
                }
            },
            sftp: {
                upload: {
                    files: {
                        "./": [ "public/**"]
                    },
                    options: {
                        path: "/home/node/CannondaleFun/public",
                        srcBasePath: "public/",
                        host: "www.outprog.com",
                        username: "root",
                        password: "",
                        showProgress: true,
                        createDirectories: true
                    }
                }
            }
        }
    );
    grunt.registerTask("init", "初始化views目录", function () {
        if (grunt.file.exists("./view")) {
            grunt.file.delete("./view");
        }
    });
    grunt.registerMultiTask("replace", "将指定的文件里标记data-romove属性标签删除掉", function () {
        var scriptReg = /script\.data-remove[^\n]*/g;
        var linkReg = /link.data-remove[^\n]*/g;
        var fileContent = grunt.file.read(this.data.file);
        var replacePosition = -1;
        var contentToAdd = "";
        var addLinkContent = "";
        //找到添加script标签的位置
        while (scriptReg.exec(fileContent) != null) {
            replacePosition = scriptReg.lastIndex;
        }
        if (replacePosition != -1) {
            this.data.replace.forEach(function (value, index) {
                if (/js$/.test(value)) {
                    contentToAdd += "\n        script(src='" + value + "')";
                }
            });
        }
        //console.log(contentToAdd);
        fileContent = fileContent.substring(0, replacePosition) + contentToAdd + fileContent.substring(replacePosition, fileContent.length);
        //console.log(fileContent);

        replacePosition = -1;
        contentToAdd = "";
        //找到添加link标签的位置
        while (linkReg.exec(fileContent) != null) {
            replacePosition = linkReg.lastIndex;
        }
        if (replacePosition != -1) {
            this.data.replace.forEach(function (value, index) {
                if (/css$/.test(value)) {
                    contentToAdd += "\n        link(href='" + value + "', rel='stylesheet')";
                }
            });
        }
        fileContent = fileContent.substring(0, replacePosition) + contentToAdd + fileContent.substring(replacePosition, fileContent.length);
        fileContent = fileContent.replace(scriptReg, "").replace(linkReg, "");
        //console.log(fileContent);
        grunt.file.write(this.data.file, fileContent);
    });


    grunt.loadNpmTasks("grunt-cmd-concat");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-ssh");
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    // 默认被执行的任务列表。
    grunt.registerTask("default", [
        "init",
        "copy",
        "concat",
        "uglify",
        "cssmin",
        "replace"
    ]);
}
