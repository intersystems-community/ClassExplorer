/// Cache Class Explorer v<!-- @echo package.version --> generated static content.
/// Class contains methods that return JS/CSS/HTML data for single page application.
Class ClassExplorer.StaticContent
{

/// Write the contents of xData tag
ClassMethod Write(Const As %String) As %Status
{
    Set xdata = ##class(%Dictionary.CompiledXData).%OpenId("ClassExplorer.StaticContent||"_Const).Data
    set status=##class(%XML.TextReader).ParseStream(xdata, .textreader)
    while textreader.Read() { if (textreader.NodeType="chars") { w textreader.Value } }
    return $$$OK
}

XData HTML
{
<data>
<![CDATA[<!-- @include ../web/index.html -->]]>
</data>
}

XData CSS
{
<data>
<![CDATA[<!-- @include ../web/css/index.css -->]]>
</data>
}

XData JS
{
<data>
<![CDATA[<!-- @include ../web/js/index.js -->]]>
</data>
}

}
