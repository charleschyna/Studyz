import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  GraduationCap, 
  BarChart3, 
  Users, 
  Bell, 
  Shield, 
  Zap,
  CheckCircle,
  ArrowRight,
  Lock,
  Mail,
  Phone,
  MessageSquare,
  Building,
  Send
} from 'lucide-react';

const Index = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    schoolName: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log('Form submitted:', formData);
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      schoolName: '',
      message: ''
    });
    // Show success message (you can implement this with a toast notification)
    alert('Thank you for your interest! We will contact you soon.');
  };

  const features = [
    {
      icon: <GraduationCap className="h-6 w-6 text-blue-600" />,
      title: "Student Management",
      description: "Efficiently manage student records, attendance, and academic performance all in one place."
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-blue-600" />,
      title: "Performance Analytics",
      description: "Advanced analytics and reporting tools to track and visualize student progress over time."
    },
    {
      icon: <Users className="h-6 w-6 text-blue-600" />,
      title: "Teacher Dashboard",
      description: "Comprehensive dashboard for teachers to manage classes, record grades, track attendance, and communicate with parents."
    },
    {
      icon: <Users className="h-6 w-6 text-blue-600" />,
      title: "Parent Portal",
      description: "Keep parents informed with real-time updates on their child's academic journey."
    },
    {
      icon: <Bell className="h-6 w-6 text-blue-600" />,
      title: "Instant Notifications",
      description: "Stay updated with important announcements, grades, and attendance alerts."
    },
    {
      icon: <Shield className="h-6 w-6 text-blue-600" />,
      title: "Secure & Reliable",
      description: "Built with industry-standard security measures to protect sensitive student data."
    },
    {
      icon: <Zap className="h-6 w-6 text-blue-600" />,
      title: "Fast & Responsive",
      description: "Lightning-fast performance across all devices for seamless user experience."
    }
  ];

  const testimonials = [
    {
      quote: "This system has revolutionized how we track and improve student performance.",
      author: "Gerald Nzinya",
      role: "School Principal"
    },
    {
      quote: "The analytics tools help me identify areas where students need extra support.",
      author: "Mary Wangari",
      role: "Teacher"
    },
    {
      quote: "I can easily keep track of my child's progress and communicate with teachers.",
      author: "Johnson Otieno",
      role: "Parent"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-slate-900">STUDIZ</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/auth">
                <Button>
                  <Lock className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0" 
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.3)'
          }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-48">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight">
            Student Performance
            <span className="block text-blue-400">Tracking System</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-200 max-w-3xl mx-auto">
            Empower your educational institution with our comprehensive student performance tracking solution. Monitor progress, engage parents, and make data-driven decisions.
          </p>
          <div className="mt-10">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 max-w-xl mx-auto">
              <h3 className="text-white font-semibold mb-2 flex items-center justify-center">
                <Lock className="h-4 w-4 mr-2" />
                Access Information
              </h3>
              <p className="text-slate-200 text-sm">
                Access to the system is managed by school administrators. Teachers and parents receive their login credentials directly from the school administration.
              </p>
            </div>
          </div>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-slate-900/40 z-[1]" />
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Powerful Features</h2>
            <p className="mt-4 text-lg text-slate-600">Everything you need to manage student performance effectively</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">What People Say</h2>
            <p className="mt-4 text-lg text-slate-600">Trusted by educators and parents</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="p-6 bg-white rounded-2xl shadow-sm">
                <div className="flex items-center mb-4">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div className="h-1 w-1 rounded-full bg-slate-300 mx-2" />
                  <span className="text-sm text-slate-500">Verified</span>
                </div>
                <p className="text-slate-700 mb-4">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold text-slate-900">{testimonial.author}</p>
                  <p className="text-sm text-slate-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Get in Touch</h2>
              <p className="text-lg text-slate-600 mb-8">
                Ready to transform your school's performance tracking? Contact us for a personalized consultation and system customization tailored to your school's needs.
              </p>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="mt-1">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Email</h3>
                    <p className="text-slate-600">info@studiz.com</p>
                    <p className="text-slate-500 text-sm">We'll respond within 24 hours</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="mt-1">
                    <Phone className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Phone</h3>
                    <p className="text-slate-600">+254 757 581 810</p>
                    <p className="text-slate-500 text-sm">Mon-Sat from 7am to 5pm</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-slate-50 p-8 rounded-2xl">
              <h3 className="text-2xl font-semibold text-slate-900 mb-6">Request Installation & Customization</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                    Your Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                  
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+254 7XX XXX XXX"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="schoolName" className="block text-sm font-medium text-slate-700 mb-1">
                    School Name
                  </label>
                  <Input
                    id="schoolName"
                    name="schoolName"
                    value={formData.schoolName}
                    onChange={handleInputChange}
                    placeholder="Enter your school name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tell us about your school and specific requirements..."
                    className="h-32"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-600 rounded-3xl p-8 md:p-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Transform Your School?
            </h2>
            <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              Contact us today to get started with our student performance tracking system.
            </p>
            <Button size="lg" variant="secondary" className="h-12 px-8" onClick={() => {
              const contactSection = document.querySelector('#contact');
              contactSection?.scrollIntoView({ behavior: 'smooth' });
            }}>
              <MessageSquare className="h-5 w-5 mr-2" />
              Get in Touch
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center text-white mb-4">
                <GraduationCap className="h-6 w-6" />
                <span className="ml-2 font-bold">STUDIZ</span>
              </div>
              <p className="text-sm">
                Empowering education through technology and innovation.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li>Features</li>
                <li>Security</li>
                <li>Support</li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>About</li>
                <li>Contact</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  info@studiz.com
                </li>
                <li className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  +254 712 345 678
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-800 text-sm text-center">
            &copy; {new Date().getFullYear()} STUDIZ. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
