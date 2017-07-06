/// Cache Class Explorer v<!-- @echo package.version -->
/// Class contains methods that return structured classes/packages data.
Class ClassExplorer.ClassView
{

/// Return list with all namespaces
ClassMethod getAllNamespacesList() As %ZEN.proxyObject
{
    set resp = ##class(%ZEN.proxyObject).%New()
    set resp.namespaces = ##class(%ZEN.proxyObject).%New()
    set resp.currentNamespace = $NAMESPACE
    set result = ##class(%ResultSet).%New("%SYS.Namespace:List")
    do result.Execute()
    while (result.Next()) {
        set ns = ##class(%ZEN.proxyObject).%New()
        set ns.remote = result.Get("Remote")
        set ns.status = result.Get("Status")
        do resp.namespaces.%DispatchSetProperty(result.Get("Nsp"), ns)
    }
    return resp
}

/// Returns structured class tree with all classes available in current namespace
ClassMethod getClassTree(namespace As %String, showMapped = 0) As %ZEN.proxyObject
{
    zn:$GET(namespace)'="" namespace
    set resp = ##class(%ZEN.proxyObject).%New()

    set showSystem = (namespace="%SYS")
    do $System.OBJ.GetClassList(.classes, "/system="_showSystem_" /percent="
        _showSystem_" /mapped=" _ showMapped)
    set objects = ##class(%Library.ArrayOfObjects).%New()
    set lastParts = $LB()

    set level = 1
    do objects.SetAt(resp, level)

	set name = $order(classes(""))
    while (name '= "") {
        //if ($EXTRACT(name, 1, 1) = "%") && ($NAMESPACE '= "%SYS") { continue }
        set parts = $LISTFROMSTRING(name, ".")
        set level = 1
        while ((level < $LISTLENGTH(parts)) && ($LISTGET(lastParts, level) = ("/"_$LISTGET(parts, level)))) {
            set level = level + 1
        }
        set resp = objects.GetAt(level)
        if (resp="") {
            set resp = ##class(%ZEN.proxyObject).%New()
            do objects.GetAt(level - 1).%DispatchSetProperty("/" _ $LISTGET(parts, level - 1), resp)
            do objects.SetAt(resp, level)
        }
        while ($LISTLENGTH(parts) > level) {
            set level = level + 1
            set resp = ##class(%ZEN.proxyObject).%New()
            do objects.GetAt(level - 1).%DispatchSetProperty("/" _ $LISTGET(parts, level - 1), resp)
            do objects.SetAt(resp, level)
        }
        if ($LISTLENGTH(parts) = level) {
            do resp.%DispatchSetProperty($LISTGET(parts, level), 0)
        }
        set lastParts = parts
        for i=1:1:$LISTLENGTH(lastParts)-1 {
            set $LIST(lastParts, i) = "/"_$LISTGET(lastParts, i)
        }
        set name = $order(classes(name))
    }

    quit objects.GetAt(1)
}

/// Return structured data about class.
ClassMethod fillClassData(oData As %ZEN.proxyObject, className As %String, level As %String = "", currLevel As %Integer = 0) As %ZEN.proxyObject [ Private ]
{
    if ((level'="") && (+currLevel>+level)) { quit "" }
    set currLevel = $increment(currLevel)
    set classDefinition = ##class(%Dictionary.ClassDefinition).%OpenId(className)
    set compiledClassDefinition = ##class(%Dictionary.CompiledClass).%OpenId(className)
    if (classDefinition = "") || (oData.classes.%DispatchGetProperty(classDefinition.Name) '= "") quit ""

    set oClass = ##class(%ZEN.proxyObject).%New()
    do oData.classes.%DispatchSetProperty(classDefinition.Name, oClass) // prevent from recursive setup
    set package = $LISTTOSTRING($LIST($LISTFROMSTRING(classDefinition.Name, "."), 1, *-1),".")
    set oProperties = ##class(%ZEN.proxyObject).%New()
    set oQueries = ##class(%ZEN.proxyObject).%New()
    set oIndices = ##class(%ZEN.proxyObject).%New()
    set oXDatas = ##class(%ZEN.proxyObject).%New()

    set oClass.isDataType = classDefinition.ClientDataTypeIsDefined()
    set oClass.isOdbcType = classDefinition.OdbcTypeIsDefined()
    set oClass.isSoapBindingStyle = classDefinition.SoapBindingStyleIsDefined()
    set oClass.isSoapBodyUse = classDefinition.SoapBodyUseIsDefined()
    set oClass.isSqlCategory = classDefinition.SqlCategoryIsDefined()

    set props = ##class(%Dictionary.ClassDefinition).%OpenId("%Dictionary.ClassDefinition")
    for j=1:1:props.Properties.Count() {
        set pname = props.Properties.GetAt(j).Name
        set:((pname '= "parent")
             && ('props.Properties.GetAt(j).Private)
             && ('$IsObject($PROPERTY(classDefinition, pname)))) $PROPERTY(oClass, pname) = $PROPERTY(classDefinition, pname)
    }
    if (oClass.TimeChanged) { set oClass.TimeChanged = $zdatetime(oClass.TimeChanged) }
    if (oClass.TimeCreated) { set oClass.TimeCreated = $zdatetime(oClass.TimeCreated) }
    if ((compiledClassDefinition '= "") && (compiledClassDefinition.ClassType '= "")) {
        set oClass.ClassType = compiledClassDefinition.ClassType // set class type from all inherited classes
    }

    set oClass.Super = "" // do not quit with super at this moment
    if (oData.restrictPackage) && ('..inPackage(oData.basePackageName, package)) quit oClass
    set oClass.Super = ..correctInheritance(oData, classDefinition, package) // now expand super names

    set oClass.properties = oProperties
    set count = classDefinition.Properties.Count()
    set props = ##class(%Dictionary.ClassDefinition).%OpenId("%Dictionary.PropertyDefinition")
    for i=1:1:count {
        set oProp = ##class(%ZEN.proxyObject).%New()
        set p = classDefinition.Properties.GetAt(i)
        do oProperties.%DispatchSetProperty(p.Name, oProp)
        for j=1:1:props.Properties.Count() {
            set pname = props.Properties.GetAt(j).Name
            set:(pname '= "parent") $PROPERTY(oProp, pname) = $PROPERTY(p, pname)
        }
        if (..classExists(package _ "." _ p.Type)) {
            set oProp.Type = package _ "." _ p.Type
            do ..fillClassData(oData, package _ "." _ p.Type, level, currLevel)
        } elseif (..classExists(..extendClassFromType(p.Type))) {
            set oProp.Type = ..extendClassFromType(p.Type)
            do ..fillClassData(oData, ..extendClassFromType(p.Type), level, currLevel)
        }  else {
            set oProp.Type = ..extendClassFromType(p.Type)
        }
    }

    set oMethods = ##class(%ZEN.proxyObject).%New()
    set oClass.methods = oMethods
    set count = classDefinition.Methods.Count()
    set props = ##class(%Dictionary.ClassDefinition).%OpenId("%Dictionary.MethodDefinition")
    for i=1:1:count {
        set oMeth = ##class(%ZEN.proxyObject).%New()
        set met = classDefinition.Methods.GetAt(i)
        do oMethods.%DispatchSetProperty(met.Name, oMeth)
        for j=1:1:props.Properties.Count() {
            set pname = props.Properties.GetAt(j).Name
            set:((pname '= "parent") && (pname '= "Implementation")) $PROPERTY(oMeth, pname) = $PROPERTY(met, pname)
        }
    }

    set oParameters = ##class(%ZEN.proxyObject).%New()
    set oClass.parameters = oParameters
    set count = classDefinition.Parameters.Count()
    set props = ##class(%Dictionary.ClassDefinition).%OpenId("%Dictionary.ParameterDefinition")
    for i=1:1:count {
        set oPar = ##class(%ZEN.proxyObject).%New()
        set p = classDefinition.Parameters.GetAt(i)
        for j=1:1:props.Properties.Count() {
            set pname = props.Properties.GetAt(j).Name
            set:(pname '= "parent") $PROPERTY(oPar, pname) = $PROPERTY(p, pname)
        }
        do oParameters.%DispatchSetProperty(p.Name, oPar)
    }

    #dim q as %Dictionary.QueryDefinition
    set oClass.queries = oQueries
    set props = ##class(%Dictionary.ClassDefinition).%OpenId("%Dictionary.QueryDefinition")
    for i=1:1:classDefinition.Queries.Count() {
        set oProp = ##class(%ZEN.proxyObject).%New()
        set q = classDefinition.Queries.GetAt(i)
        for j=1:1:props.Properties.Count() {
            set pname = props.Properties.GetAt(j).Name
            set:(pname '= "parent") $PROPERTY(oProp, pname) = $PROPERTY(q, pname)
        }
        do oQueries.%DispatchSetProperty(q.Name, oProp)
    }

    #dim xd as %Dictionary.XDataDefinition
    set oClass.xdatas = oXDatas
    set props = ##class(%Dictionary.ClassDefinition).%OpenId("%Dictionary.XDataDefinition")
    for i=1:1:classDefinition.XDatas.Count() {
        set oProp = ##class(%ZEN.proxyObject).%New()
        set xd = classDefinition.XDatas.GetAt(i)
        for j=1:1:props.Properties.Count() {
            set pname = props.Properties.GetAt(j).Name
            set:((pname '= "parent") && (pname '= "Object")) $PROPERTY(oProp, pname) = $PROPERTY(xd, pname)
        }
        do oXDatas.%DispatchSetProperty(xd.Name, oProp)
    }

    #dim ind as %Dictionary.IndexDefinition
    set oClass.indices = oIndices
    set props = ##class(%Dictionary.ClassDefinition).%OpenId("%Dictionary.IndexDefinition")
    for i=1:1:classDefinition.Indices.Count() {
        set oProp = ##class(%ZEN.proxyObject).%New()
        set ind = classDefinition.Indices.GetAt(i)
        for j=1:1:props.Properties.Count() {
            set pname = props.Properties.GetAt(j).Name
            set:(pname '= "parent") $PROPERTY(oProp, pname) = $PROPERTY(ind, pname)
        }
        do oIndices.%DispatchSetProperty(ind.Name, oProp)
    }

    do ..collectInheritance(oData, oClass.Super, level, currLevel)

    quit oClass
}

/// Return method data.
ClassMethod getMethod(className As %String, methodName As %String, namespace As %String) As %ZEN.proxyObject
{
    zn:$GET(namespace)'="" namespace
    set oMeth = ##class(%ZEN.proxyObject).%New()
    set met = ##class(%Dictionary.MethodDefinition).%OpenId(className _ "||" _ methodName)
    if (met = "") { set oMeth.error = 1 quit oMeth }

    set oMeth.description = met.Description
    set oMeth.arguments = met.FormalSpec
    set oMeth.returns = met.ReturnType
    set oMeth.code = ""
    do {
        set chars = met.Implementation.Read()
        set oMeth.code = oMeth.code _ chars
    } while (chars)

    quit oMeth
}

/// Returns if <var>packageName</var> is in <var>basePackageName</var>.
ClassMethod inPackage(basePackageName As %String, packageName As %String) As %Boolean [ Private ]
{
	set pack = $LISTFROMSTRING(packageName, ".")
	set list = $LISTFROMSTRING(basePackageName, ".")
	set OK = 1
	for i=1:1:$LISTLENGTH(list) {
		if ($LISTGET(list, i) = $LISTGET(pack, i)) {
			set OK = 1
		} else {
			set OK = 0
			quit
		}
	}
    quit OK
}

/// Wrap registered types to class names
ClassMethod extendClassFromType(typeName As %String) As %String [ Private ]
{
    return $CASE(typeName,
        "%Boolean": "%Library.Boolean",
        "%String": "%Library.String",
        "%Integer": "%Library.Integer",
        "%DataType": "%Library.DataType",
        "%Status": "%Library.Status",
        "%CacheString": "%Library.CacheString",
        "%Persistent": "%Library.Persistent",
        :typeName)
}

/// Return extended inheritance names
ClassMethod correctInheritance(oData As %ZEN.proxyObject, baseClassDefinition As %Dictionary.ClassDefinition, basePack As %String) As %String [ Private ]
{
    set superParts = $LISTFROMSTRING(baseClassDefinition.Super, ",")
    for i=1:1:$LISTLENGTH(superParts) {
        set className = $LISTGET(superParts, i)

        // try to find class with base package, if not successfull - try to add class as it is
        if (..classExists(basePack_"."_className)) {
            set clsName = basePack_"."_className
        } else {
            set clsName = ..extendClassFromType(className)
        }

        set $LIST(superParts, i) = clsName
    }
    quit $LISTTOSTRING(superParts)
}

/// Fill inheritance data
/// Returns new (correct) super
ClassMethod collectInheritance(oData As %ZEN.proxyObject, super As %String, level As %String = "", currLevel As %Integer = 0) As %Status [ Private ]
{
    set superParts = $LISTFROMSTRING(super, ",")
    for i=1:1:$LISTLENGTH(superParts) {
        do ..fillClassData(oData, $LISTGET(superParts, i), level, currLevel)
    }
    quit $$$OK
}

/// Setup basic output data object
ClassMethod getBaseOData(packageName As %String, baseNamespace As %String, savedName As %String) As %ZEN.proxyObject [ Private ]
{
    set oData = ##class(%ZEN.proxyObject).%New()
    set oData.basePackageName = packageName
    set oData.restrictPackage = 1 // expand classes only in base package
    set oData.classes = ##class(%ZEN.proxyObject).%New()

    set ns = $namespace
    zn baseNamespace
    if $get(^ClassExplorer("savedView", ns_":"_savedName)) '= "" {
        set oData.savedView = $get(^ClassExplorer("savedView", ns_":"_savedName))
    }
    zn ns

    quit oData
}

/// Returns if class with given name exists.
ClassMethod classExists(className As %String) As %Boolean
{
    quit ##class(%Dictionary.ClassDefinition).%OpenId(className) '= ""
}

/// Returns structured package data
ClassMethod getPackageView(rootPackageName As %String, namespace As %String) As %ZEN.proxyObject
{
    set baseNamespace = $namespace
    zn:$GET(namespace)'="" namespace
    set oData = ..getBaseOData(rootPackageName, baseNamespace, "PACKAGE:"_rootPackageName)
    set classes = ##class(%ResultSet).%New("%Dictionary.ClassDefinition:Summary")
    do classes.Execute()
    set listLen = $LISTLENGTH($LISTFROMSTRING(rootPackageName, ".")) // bottom level of package to extract

    while (classes.Next()) {
        set className = classes.Data("Name")
        set packageName = $LISTTOSTRING($LIST($LISTFROMSTRING(className, "."), 1, listLen), ".")
        if (packageName = rootPackageName) {
            do ..fillClassData(oData, className)
        }
    }

    quit oData
}

ClassMethod getArbitraryView(classList As %String, namespace As %String, level As %String = "")
{
	set baseNamespace = $namespace
    zn:$GET(namespace)'="" namespace
    set list = $LISTFROMSTRING(classList, ",")

    set basePackages = $LB()
    set count = 0
    for i=1:1:$LISTLENGTH(list) {
	    set packName = $PIECE($LISTGET(list, i), ".", 1)
	    if ($LISTFIND(basePackages, packName) = 0) {
		    set $LIST(basePackages, count + 1) = packName
		    set count = count + 1
	    }
    }

    set oData = ..getBaseOData($LISTTOSTRING(basePackages, ",", 1), baseNamespace, "ARBITRARY:"_classList)

    for i=1:1:$LISTLENGTH(list) {
		do ..fillClassData(oData, $LISTGET(list, i), level)
    }

    quit oData
}

}
