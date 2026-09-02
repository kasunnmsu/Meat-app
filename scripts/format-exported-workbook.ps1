param(
    [Parameter(Mandatory = $true)]
    [string]$WorkbookPath
)

$ErrorActionPreference = "Stop"

function Get-OleColor {
    param([int]$Red, [int]$Green, [int]$Blue)
    return $Red + (256 * $Green) + (65536 * $Blue)
}

$resolvedWorkbookPath = (Resolve-Path -LiteralPath $WorkbookPath).Path
$excel = $null
$workbook = $null

try {
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $excel.DisplayAlerts = $false

    $workbook = $excel.Workbooks.Open($resolvedWorkbookPath)

    foreach ($worksheet in $workbook.Worksheets) {
        $worksheet.Activate()
        $usedRange = $worksheet.UsedRange
        $rowCount = $usedRange.Rows.Count
        $columnCount = $usedRange.Columns.Count

        if ($rowCount -lt 1 -or $columnCount -lt 1) {
            continue
        }

        $header = $worksheet.Range(
            $worksheet.Cells.Item(1, 1),
            $worksheet.Cells.Item(1, $columnCount)
        )

        $header.Font.Bold = $true
        $header.Font.Color = Get-OleColor 255 255 255
        $header.Interior.Color = Get-OleColor 31 78 120
        $header.HorizontalAlignment = -4108
        $header.VerticalAlignment = -4108
        $header.WrapText = $true
        $header.RowHeight = 32

        if (-not $worksheet.AutoFilterMode -and $rowCount -gt 1) {
            $usedRange.AutoFilter() | Out-Null
        }

        $usedRange.VerticalAlignment = -4160

        for ($columnIndex = 1; $columnIndex -le $columnCount; $columnIndex++) {
            $column = $worksheet.Columns.Item($columnIndex)
            $column.AutoFit() | Out-Null

            if ($column.ColumnWidth -gt 40) {
                $column.ColumnWidth = 40
            }
            elseif ($column.ColumnWidth -lt 10) {
                $column.ColumnWidth = 10
            }

            $headerText = [string]$worksheet.Cells.Item(1, $columnIndex).Value2
            if ($headerText -match "(_em|_at|timestamp)$") {
                $column.NumberFormatLocal = "aaaa-mm-dd hh:mm:ss"
            }
        }

        $excel.ActiveWindow.DisplayGridlines = $false
        $excel.ActiveWindow.FreezePanes = $false
        $excel.ActiveWindow.SplitRow = 1
        $excel.ActiveWindow.SplitColumn = [Math]::Min(2, $columnCount)
        $excel.ActiveWindow.FreezePanes = $true

        $worksheet.PageSetup.Orientation = 2
        $worksheet.PageSetup.Zoom = $false
        $worksheet.PageSetup.FitToPagesWide = 1
        $worksheet.PageSetup.FitToPagesTall = $false

        [Runtime.InteropServices.Marshal]::ReleaseComObject($header) | Out-Null
        [Runtime.InteropServices.Marshal]::ReleaseComObject($usedRange) | Out-Null
    }

    $workbook.Save()
}
finally {
    if ($workbook) {
        $workbook.Close($false)
        [Runtime.InteropServices.Marshal]::ReleaseComObject($workbook) | Out-Null
    }

    if ($excel) {
        $excel.Quit()
        [Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
    }

    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
}
