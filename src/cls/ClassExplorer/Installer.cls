Class ClassExplorer.Installer Extends %Projection.AbstractProjection
{

Parameter VERSION = "<!-- @echo package.version -->";

Parameter Name = "/ClassExplorer";

Parameter DispatchClass = "ClassExplorer.Router";

Projection Reference As Installer;

/// This method is invoked when a class is compiled.
ClassMethod CreateProjection(cls As %String, ByRef params) As %Status
{
	set properties("NameSpace") = $Namespace
    set properties("Description") = "A WEB application for Cache UML Explorer."
    set properties("IsNameSpaceDefault") = $$$NO
    set properties("DispatchClass") = ..#DispatchClass
	
    new $Namespace
    set $Namespace = "%SYS"
    do ##class(Security.System).GetInstallationSecuritySetting(.security)
    if (security="None") {
        set properties("AutheEnabled") = $$$AutheUnauthenticated
    } else {
        set properties("AutheEnabled") = $$$AutheCache
    } 

    if ('##class(Security.Applications).Exists(..#Name)) {
        write !, "Creating WEB application " _ ..#Name _ "..."
        set st = ##class(Security.Applications).Create(..#Name, .properties)
        write !, "WEB application " _ ..#Name _ " created."
    } else {
	    set st = $$$OK
        write !, "WEB application " _ ..#Name _ " already exists, so it is ready to use."
    }
    quit st
}

/// This method is invoked when a class is 'uncompiled'.
ClassMethod RemoveProjection(cls As %String, ByRef params, recompile As %Boolean) As %Status
{
    new $Namespace
    set $Namespace = "%SYS"
    set st = $$$OK
    if (##class(Security.Applications).Exists(..#Name)) {
        write !, "Deleting WEB application " _ ..#Name _"..."
        set st = ##class(Security.Applications).Delete(..#Name)
        write !, "WEB application " _ ..#Name _ " was successfully removed."
    }
    quit st
}

}
