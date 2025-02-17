ARG IMAGE=intersystems/iris:2019.1.0S.111.0
ARG IMAGE=store/intersystems/irishealth:2019.3.0.308.0-community
ARG IMAGE=store/intersystems/iris-community:2019.3.0.309.0
ARG IMAGE=store/intersystems/iris-community:2019.4.0.379.0
ARG IMAGE=store/intersystems/iris-community:2020.1.0.197.0
ARG IMAGE=intersystemsdc/iris-community:2020.1.0.209.0-zpm
ARG IMAGE=intersystemsdc/iris-community:2020.1.0.215.0-zpm
ARG IMAGE=intersystemsdc/iris-community:latest
FROM $IMAGE

USER irisowner

WORKDIR /opt/irisapp

COPY  Installer.cls .
COPY  src src
COPY  build-for-zpm build-for-zpm
COPY irissession.sh .

USER root

RUN chmod +x ./irissession.sh
USER irisowner
SHELL ["./irissession.sh"]

RUN \
  do $SYSTEM.OBJ.Load("Installer.cls", "ck") \
  set sc = ##class(App.Installer).setup() \
  zn "%SYS" \
  write "Creating web application ..." \
  set webName = "/ClassExplorer" \
  set webProperties("DispatchClass") = "ClassExplorer.Router" \
  set webProperties("NameSpace") = "IRISAPP" \
  set webProperties("Enabled") = 1 \
  set webProperties("AutheEnabled") = 32 \
  set sc = ##class(Security.Applications).Create(webName, .webProperties) \
  write sc \
  write "Web application "_webName_" has been created!"

# bringing the standard shell back
SHELL ["/bin/bash", "-c"]
CMD [ "-l", "/usr/irissys/mgr/messages.log" ]
