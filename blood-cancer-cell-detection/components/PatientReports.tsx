import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Search, Eye, Download, Calendar, User } from "lucide-react";

// Mock patient reports data
const mockReports = [
  {
    id: "BCS-2024-0451",
    patientId: "P-00234",
    age: 45,
    gender: "Female",
    date: "2024-01-24",
    result: "Cancerous",
    confidence: 94.8,
    hospital: "City General",
    status: "Reviewed",
  },
  {
    id: "BCS-2024-0450",
    patientId: "P-00233",
    age: 38,
    gender: "Male",
    date: "2024-01-24",
    result: "Non-Cancerous",
    confidence: 98.2,
    hospital: "St. Mary's",
    status: "Reviewed",
  },
  {
    id: "BCS-2024-0449",
    patientId: "P-00232",
    age: 52,
    gender: "Female",
    date: "2024-01-23",
    result: "Cancerous",
    confidence: 92.5,
    hospital: "University Med",
    status: "Pending Review",
  },
  {
    id: "BCS-2024-0448",
    patientId: "P-00231",
    age: 61,
    gender: "Male",
    date: "2024-01-23",
    result: "Non-Cancerous",
    confidence: 99.1,
    hospital: "City General",
    status: "Reviewed",
  },
  {
    id: "BCS-2024-0447",
    patientId: "P-00230",
    age: 47,
    gender: "Female",
    date: "2024-01-23",
    result: "Cancerous",
    confidence: 89.3,
    hospital: "Regional Care",
    status: "Pending Review",
  },
];

export function PatientReports() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900">Patient Reports</h1>
          <p className="text-gray-500 mt-1">
            View and manage all patient diagnosis reports
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Download className="w-4 h-4 mr-2" />
          Export All
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by Sample ID, Patient ID, or Hospital..."
              className="pl-10"
            />
          </div>
          <select className="h-10 rounded-md border border-input bg-input-background px-3 py-2 text-sm">
            <option>All Results</option>
            <option>Cancerous Only</option>
            <option>Non-Cancerous Only</option>
          </select>
          <select className="h-10 rounded-md border border-input bg-input-background px-3 py-2 text-sm">
            <option>All Statuses</option>
            <option>Reviewed</option>
            <option>Pending Review</option>
          </select>
        </div>
      </Card>

      {/* Reports Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                  Sample ID
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                  Hospital
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                  Result
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                  Confidence
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-900">{report.patientId}</p>
                        <p className="text-xs text-gray-500">
                          {report.age}y, {report.gender}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {report.date}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {report.hospital}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      className={
                        report.result === "Cancerous"
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }
                    >
                      {report.result}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.confidence}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      className={
                        report.status === "Reviewed"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {report.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing 1 to 5 of 1,547 results
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" className="bg-blue-50 text-blue-700">
              1
            </Button>
            <Button variant="outline" size="sm">
              2
            </Button>
            <Button variant="outline" size="sm">
              3
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
