/// Cache Class Explorer v1.21.3
/// REST interface for ClassExplorer
Class ClassExplorer.Router Extends %CSP.REST
{

XData UrlMap
{
<Routes>
   <Route Url="/" Method="GET" Call="Index"/>
   <Route Url="/index" Method="GET" Call="Index"/>
   <Route Url="/css/index.css" Method="GET" Call="GetCss"/>
   <Route Url="/js/index.js" Method="GET" Call="GetJs"/>
   <Route Url="/Test" Method="GET" Call="Test"/>
   <Route Url="/GetClassTree" Method="GET" Call="GetClassTree"/>
   <Route Url="/GetAllNamespacesList" Method="GET" Call="GetAllNamespacesList"/>
   <Route Url="/GetPackageView" Method="GET" Call="GetPackageView"/>
   <Route Url="/GetArbitraryView" Method="GET" Call="GetArbitraryView"/>
   <Route Url="/GetMethod" Method="GET" Call="GetMethod"/>
   <Route Url="/SaveView" Method="POST" Call="SaveView"/>
   <Route Url="/ResetView" Method="GET" Call="ResetView"/>
</Routes>
}

/// Method returns whole class tree visible in the current namespace.
ClassMethod GetClassTree() As %Status
{
    do ##class(ClassExplorer.ClassView).getClassTree(%request.Get("namespace"), %request.Get("mapped")).%ToJSON(, "o")
    return $$$OK
}

/// Returns classTree by given class name
ClassMethod GetArbitraryView() As %Status
{
    set classList = %request.Get("list")
    set classData = ##class(ClassView).getArbitraryView(classList, %request.Get("namespace"), %request.Get("level"))
    do classData.%ToJSON(, "o")
    return $$$OK
}

/// Saves the view preferences
ClassMethod SaveView() As %Status
{
    set name = %request.Get("name")
    set content = %request.Content.Read($$$MaxStringLength) // ~ 7mb
    set ^ClassExplorer("savedView", ##class(ClassExplorer.ClassView).shortenSavedName(name)) = content
    write "{""OK"":true}"
    return $$$OK
}

/// Saves the view preferences
ClassMethod ResetView() As %Status
{
    set name = %request.Get("name")
    kill ^ClassExplorer("savedView", ##class(ClassExplorer.ClassView).shortenSavedName(name))
    write "{""OK"":true}"
    return $$$OK
}

/// Returns all package class trees by given package name
ClassMethod GetPackageView() As %Status
{
    set packageName = %request.Get("name")
    set classData = ##class(ClassView).getPackageView(packageName, %request.Get("namespace"))
    do classData.%ToJSON(, "o")
    return $$$OK
}

/// Return the list of all namespaces
ClassMethod GetAllNamespacesList() As %Status
{
    do ##class(ClassExplorer.ClassView).getAllNamespacesList().%ToJSON(, "o")
    return $$$OK
}

/// Returns method description and code
ClassMethod GetMethod() As %Status
{
    set className = %request.Get("className")
    set methodName = %request.Get("methodName")
    set methodData = ##class(ClassView).getMethod(className, methodName, %request.Get("namespace"))
    do methodData.%ToJSON(, "o")
    return $$$OK
}

/// Method returns user application CSS.
ClassMethod GetCss() As %Status
{
    #define CompileTime ##Expression("""" _ $zd($h, 11) _ ", "_ $zdt($NOW(0), 2,1) _ " GMT""")
    set %response.CharSet = "utf-8"
    set %response.ContentType = "text/css"
    do %response.SetHeader("Last-Modified", $$$CompileTime)
   
    if %request.GetCgiEnv("HTTP_IF_MODIFIED_SINCE")=$$$CompileTime {
        do ..Http304()
    } else {
        do ##class(StaticContent).Write("CSS")
    }
    
    return $$$OK
}

/// Method returns user application JavaScript.
ClassMethod GetJs() As %Status
{
    #define CompileTime ##Expression("""" _ $zd($h, 11) _ ", "_ $zdt($NOW(0), 2,1) _ " GMT""")
    set %response.CharSet = "utf-8"
    set %response.ContentType = "text/javascript"
    do %response.SetHeader("Last-Modified", $$$CompileTime)
    
    if %request.GetCgiEnv("HTTP_IF_MODIFIED_SINCE")=$$$CompileTime {
        do ..Http304()
    } else {
        do ##class(StaticContent).Write("JS")
    }
    
    return $$$OK
}

/// Method returns user application HTML.
ClassMethod Index() As %Status
{
    #define CompileTime ##Expression("""" _ $zd($h, 11) _ ", "_ $zdt($NOW(0), 2,1) _ " GMT""")
    do %response.SetHeader("Last-Modified", $$$CompileTime)
        
    if %request.GetCgiEnv("HTTP_IF_MODIFIED_SINCE")=$$$CompileTime {
        do ..Http304()
    } else {
        do ##class(StaticContent).Write("HTML")
    }
    
    return $$$OK
}

/// Issue an "304 Not Modified" status
ClassMethod Http304() As %Status
{
    Set %response.Status="304 Not Modified"
    Quit $$$OK
}

}
