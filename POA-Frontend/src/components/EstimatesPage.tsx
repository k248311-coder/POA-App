import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Calculator, FileSpreadsheet } from "lucide-react";

export function EstimatesPage({ projectId: _projectId }: { projectId: string }) {
  const [numDevs, setNumDevs] = useState(3);
  const [numQAs, setNumQAs] = useState(2);
  const [hoursPerDay, setHoursPerDay] = useState(8);

  const estimates = [
    {
      id: "S1",
      story: "User can login with email and password",
      devHours: 16,
      qaHours: 8,
      totalHours: 24,
      cost: 2400,
    },
    {
      id: "S2",
      story: "User can sign up with email verification",
      devHours: 24,
      qaHours: 12,
      totalHours: 36,
      cost: 3600,
    },
    {
      id: "S3",
      story: "User can add items to cart",
      devHours: 20,
      qaHours: 10,
      totalHours: 30,
      cost: 3000,
    },
    {
      id: "S4",
      story: "User can checkout and pay",
      devHours: 32,
      qaHours: 16,
      totalHours: 48,
      cost: 4800,
    },
    {
      id: "S5",
      story: "Admin can manage products",
      devHours: 40,
      qaHours: 20,
      totalHours: 60,
      cost: 6000,
    },
  ];

  const totalDevHours = estimates.reduce((sum, item) => sum + item.devHours, 0);
  const totalQAHours = estimates.reduce((sum, item) => sum + item.qaHours, 0);
  const totalHours = totalDevHours + totalQAHours;
  const totalCost = estimates.reduce((sum, item) => sum + item.cost, 0);

  const devDays = numDevs > 0 ? (totalDevHours / (numDevs * hoursPerDay)).toFixed(1) : "0";
  const qaDays = numQAs > 0 ? (totalQAHours / (numQAs * hoursPerDay)).toFixed(1) : "0";
  const totalDays = Math.max(parseFloat(devDays), parseFloat(qaDays)).toFixed(1);

  return (
    <div className="space-y-6">
      <div>
        <h1>Estimates</h1>
        <p className="text-gray-600 mt-1">Time and cost estimates for all stories</p>
      </div>

      {/* Resource Allocation Calculator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-teal-600" />
            Resource Allocation Calculator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="numDevs">Number of Developers</Label>
              <Input
                id="numDevs"
                type="number"
                min="1"
                value={numDevs}
                onChange={(e) => setNumDevs(parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="numQAs">Number of QA Engineers</Label>
              <Input
                id="numQAs"
                type="number"
                min="1"
                value={numQAs}
                onChange={(e) => setNumQAs(parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hoursPerDay">Hours per Day</Label>
              <Input
                id="hoursPerDay"
                type="number"
                min="1"
                max="24"
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-600 mb-1">Development Days</p>
              <p className="text-2xl text-blue-700">{devDays}</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-purple-600 mb-1">QA Days</p>
              <p className="text-2xl text-purple-700">{qaDays}</p>
            </div>
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <p className="text-sm text-teal-600 mb-1">Total Timeline (Days)</p>
              <p className="text-2xl text-teal-700">{totalDays}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estimates Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-teal-600" />
            Story Estimates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Story ID</TableHead>
                  <TableHead>Story</TableHead>
                  <TableHead className="text-right">Dev Hours</TableHead>
                  <TableHead className="text-right">QA Hours</TableHead>
                  <TableHead className="text-right">Total Hours</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {estimates.map((estimate) => (
                  <TableRow key={estimate.id}>
                    <TableCell className="font-medium">{estimate.id}</TableCell>
                    <TableCell>{estimate.story}</TableCell>
                    <TableCell className="text-right">{estimate.devHours}</TableCell>
                    <TableCell className="text-right">{estimate.qaHours}</TableCell>
                    <TableCell className="text-right">{estimate.totalHours}</TableCell>
                    <TableCell className="text-right">${estimate.cost.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-gray-50 font-medium">
                  <TableCell colSpan={2}>Total</TableCell>
                  <TableCell className="text-right">{totalDevHours}</TableCell>
                  <TableCell className="text-right">{totalQAHours}</TableCell>
                  <TableCell className="text-right">{totalHours}</TableCell>
                  <TableCell className="text-right">${totalCost.toLocaleString()}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex gap-2">
            <Button variant="outline">
              Export as CSV
            </Button>
            <Button variant="outline">
              Export as PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
