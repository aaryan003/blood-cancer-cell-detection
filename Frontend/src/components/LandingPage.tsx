import { Link } from "react-router";
import { Activity, Shield, BarChart3, Users, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-gray-900">Blood Cancer</h1>
                <p className="text-xs text-gray-500">Cell Detection System</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/signup">
                <Button>Sign Up</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Advanced Blood Cancer Cell Detection
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Leverage cutting-edge AI technology to detect and analyze blood cancer cells 
            with unprecedented accuracy. Streamline your diagnostic workflow and improve patient outcomes.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" className="flex items-center gap-2">
                Get Started
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/demo">
              <Button variant="outline" size="lg">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Comprehensive Healthcare Solution
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need for accurate blood cancer cell detection and analysis
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <Activity className="w-8 h-8 text-blue-600 mb-2" />
                <CardTitle className="text-lg">AI-Powered Detection</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Advanced machine learning algorithms for precise cell identification and classification
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="w-8 h-8 text-blue-600 mb-2" />
                <CardTitle className="text-lg">HIPAA Compliant</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Enterprise-grade security ensuring patient data privacy and regulatory compliance
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="w-8 h-8 text-blue-600 mb-2" />
                <CardTitle className="text-lg">Real-time Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Comprehensive metrics and performance tracking for continuous improvement
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="w-8 h-8 text-blue-600 mb-2" />
                <CardTitle className="text-lg">Multi-user Support</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Role-based access for doctors, lab technicians, and hospital administrators
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Diagnostic Process?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join healthcare professionals worldwide who trust our AI-powered solution
          </p>
          <Link to="/signup">
            <Button size="lg" className="flex items-center gap-2 mx-auto">
              Start Free Trial
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-500">
          <p>&copy; 2024 Blood Cancer Cell Detection System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}