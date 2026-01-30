import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePickerWithRange } from "@/components/shared/DatePickerWithRange";

export default function Reports() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Relatórios</h1>
        <div className="flex items-center gap-4">
          <DatePickerWithRange />
          <Button>Gerar Relatório</Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Relatório de Faturamento</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Placeholder for chart */}
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
            <p className="text-muted-foreground">Gráfico de faturamento aparecerá aqui.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
