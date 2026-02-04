// src/pages/Landing.jsx
import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Users, Video, Award, BookOpen, ChevronRight, Star, CheckCircle, Play, MessageSquare, Calendar, Zap, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroBackground from '../assets/students-learning.jpg';

// Import your new logo
import peerlearnLogo from '../assets/peerlearn-logo.png'; // Update with your actual logo filename

const Landing = () => {
  const [videoPlaying, setVideoPlaying] = useState(false);
  const sectionRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
          }
        });
      },
      { threshold: 0.1 }
    );

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const stats = [
    { number: "500+", label: "Active Learners", icon: Users },
    { number: "200+", label: "Expert Tutors", icon: Award },
    { number: "1000+", label: "Sessions Completed", icon: BookOpen },
    { number: "4.9", label: "Average Rating", icon: Star }
  ];

  const features = [
    { 
      title: "Live Peer Sessions", 
      desc: "Real-time learning with peers through interactive video sessions",
      icon: Video,
      color: "bg-blue-50 text-blue-600"
    },
    { 
      title: "Smart Matching", 
      desc: "AI-powered matching with tutors based on your learning goals",
      icon: MessageSquare,
      color: "bg-emerald-50 text-emerald-600"
    },
    { 
      title: "Flexible Scheduling", 
      desc: "Learn at your own pace with flexible session timings",
      icon: Calendar,
      color: "bg-purple-50 text-purple-600"
    },
    { 
      title: "Progress Tracking", 
      desc: "Monitor your learning journey with detailed analytics",
      icon: BookOpen,
      color: "bg-amber-50 text-amber-600"
    },
    { 
      title: "Community Support", 
      desc: "Join study groups and connect with like-minded learners",
      icon: Users,
      color: "bg-pink-50 text-pink-600"
    },
    { 
      title: "Accessibility first", 
      desc: "Suitable and easy to use for all range of users",
      icon: Zap,
      color: "bg-indigo-50 text-indigo-600"
    }
  ];

  // Testimonials with real Unsplash images
  const testimonials = [
    { 
      id: 1,
      name: "Sarah Chen", 
      role: "Computer Science Student", 
      text: "PeerLearn helped me master React in just 6 weeks! The community support and interactive sessions made complex topics much easier to understand.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
    },
    { 
      id: 2,
      name: "Michael Rodriguez", 
      role: "Mathematics Tutor", 
      text: "As a tutor, I've helped over 50 students through this platform. The scheduling system is seamless and the video quality is excellent.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
    },
    { 
      id: 3,
      name: "Emma Wilson", 
      role: "Language Learner", 
      text: "The peer matching system connected me with the perfect study partners. My Spanish improved more in 2 months than in a year of self-study!",
      rating: 5,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
    },
    { 
      id: 4,
      name: "David Kim", 
      role: "Data Science Student", 
      text: "The project-based learning approach with real peers gave me practical skills that landed me my first data science job. Highly recommend!",
      rating: 5,
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
    },
    { 
      id: 5,
      name: "Priya Sharma", 
      role: "Physics Tutor", 
      text: "I love how I can create custom sessions for different learning levels. The progress tracking helps me tailor my teaching approach to each student.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
    },
    { 
      id: 6,
      name: "James Anderson", 
      role: "Business Student", 
      text: "The collaborative learning environment is incredible. I've built a network of peers who continue to support each other even after sessions end.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
    },
    { 
      id: 7,
      name: "Maria Garcia", 
      role: "Chemistry Student", 
      text: "As an introvert, I was hesitant about peer learning, but the platform made it so comfortable. Now I lead study groups myself!",
      rating: 5,
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
    },
    { 
      id: 8,
      name: "Alex Turner", 
      role: "Web Development Tutor", 
      text: "The real-time code collaboration feature is a game-changer. My students can see exactly what I'm doing and ask questions instantly.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
    }
  ];

  // Duplicate testimonials for seamless marquee effect
  const duplicatedTestimonials = [...testimonials, ...testimonials];

  // Scroll to testimonials function
  const scrollToTestimonials = () => {
    document.getElementById('testimonials').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Add animations and marquee CSS */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes marqueeLeft {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        @keyframes marqueeRight {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        
        .animate-marquee-left {
          animation: marqueeLeft 30s linear infinite;
        }
        
        .animate-marquee-right {
          animation: marqueeRight 30s linear infinite;
        }
        
        .pause-on-hover:hover .animate-marquee-left,
        .pause-on-hover:hover .animate-marquee-right {
          animation-play-state: paused;
        }
        
        /* Smooth scroll */
        html {
          scroll-behavior: smooth;
        }
        
        /* Testimonial card hover effect */
        .testimonial-card {
          transition: all 0.3s ease;
          border: 2px solid #e2e8f0; /* Default border */
        }
        
        .testimonial-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.15);
          border-color: #3b82f6; /* Blue border on hover */
        }
        
        .testimonial-card:hover .quote-icon {
          transform: scale(1.1);
        }
        
        .testimonial-card:hover .profile-img {
          transform: scale(1.05);
        }
      `}</style>

      {/* Hero Section with Background Image */}
      <header className="relative min-h-[90vh] overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
             backgroundImage: `url(${heroBackground})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 via-slate-900/50 to-slate-900/30"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>
        </div>

        {/* Navigation - PERFECT LOGO ALIGNMENT */}
        <nav className="relative z-10 container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1"> {/* Reduced gap */}
              {/* Updated Logo - Big and perfectly aligned */}
              {peerlearnLogo ? (
                <img 
                  src={peerlearnLogo} 
                  alt="PeerLearn Logo" 
                  className="h-20 w-auto"
                  style={{ display: 'block',
                        margin: '0',
                        padding: '0',
                        lineHeight: '0' }}
                />
              ) : (
                <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20 mr-2">
                  <Users className="w-8 h-8 text-white" />
                </div>
              )}
              <span className="text-2xl font-bold text-white mt-1">PeerLearn</span> {/* mt-1 for vertical alignment */}
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-white/90 hover:text-white font-medium transition hover:scale-105">Features</a>
              <button 
                onClick={scrollToTestimonials}
                className="text-white/90 hover:text-white font-medium transition hover:scale-105 bg-transparent border-none cursor-pointer"
              >
                Testimonials
              </button>
              <Link to="/Login" className="text-white/90 hover:text-white font-medium transition hover:scale-105">Login</Link>
              <Link 
                to="/SignUp" 
                className="bg-white text-slate-900 px-6 py-2.5 rounded-xl font-semibold hover:bg-slate-100 transition-all hover:shadow-lg hover:scale-105"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </nav>

        {/* Main Hero Content */}
        <div className="relative z-10 container mx-auto px-6 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8" ref={el => sectionRefs.current[0] = el}>
              <div>
                <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white font-medium text-sm mb-6 animate-fade-in-up delay-100">
                  🎓 Transform Your Learning Journey
                </span>
                <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
                  Learn <span className="text-blue-300">Together,</span>
                  <span className="block">Grow <span className="text-emerald-300">Together</span></span>
                </h1>
                <p className="text-xl text-white/90 mb-8 max-w-lg leading-relaxed">
                  Connect with peers, share knowledge, and accelerate your learning journey through collaborative sessions and expert guidance in an interactive environment.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/SignUp" 
                  className="inline-flex items-center justify-center bg-white text-slate-900 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-slate-100 transition-all hover:shadow-xl transform hover:-translate-y-1 shadow-lg"
                >
                  Start Learning Free
                  <ArrowRight className="ml-3 w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            ref={el => sectionRefs.current[2] = el}
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={index} 
                  className="text-center p-6 rounded-2xl bg-gradient-to-b from-white to-slate-50 border border-slate-100 shadow-sm hover:shadow-md transition-shadow hover:-translate-y-1 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-50 to-white rounded-2xl mb-4 border border-slate-100">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-4xl font-bold text-slate-900 mb-2">{stat.number}</div>
                  <div className="text-slate-600 font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-b from-white to-slate-50">
        <div className="container mx-auto px-6">
          <div 
            className="text-center max-w-3xl mx-auto mb-16"
            ref={el => sectionRefs.current[3] = el}
          >
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Everything You Need for
              <span className="text-blue-600"> Effective Learning</span>
            </h2>
            <p className="text-xl text-slate-600 leading-relaxed">
              Our platform combines cutting-edge technology with proven learning methodologies to create the perfect peer learning environment.
            </p>
          </div>
          
          <div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            ref={el => sectionRefs.current[4] = el}
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index} 
                  className="group bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-blue-200 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Marquee Section - UPDATED */}
      <section id="testimonials" className="py-20 bg-white overflow-hidden">
        <div className="container mx-auto px-6">
          <div 
            className="text-center max-w-3xl mx-auto mb-16"
            ref={el => sectionRefs.current[5] = el}
          >
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              What Our Community Says
            </h2>
            <p className="text-xl text-slate-600 leading-relaxed">
              Hear from learners and tutors who transformed their educational journey with PeerLearn
            </p>
          </div>
          
          {/* Marquee Container */}
          <div className="relative overflow-hidden py-4 pause-on-hover">
            {/* Gradient overlay on edges */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white via-white to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white via-white to-transparent z-10 pointer-events-none"></div>
            
            {/* Marquee Row 1 - Moves LEFT (faster: 30s) */}
            <div className="flex animate-marquee-left mb-10">
              {duplicatedTestimonials.map((testimonial, index) => (
                <div 
                  key={`first-${testimonial.id}-${index}`} 
                  className="flex-shrink-0 w-80 mx-4 testimonial-card bg-white rounded-2xl p-6 shadow-md"
                >
                  <Quote className="w-8 h-8 text-blue-400 mb-4 quote-icon transition-transform duration-300" />
                  <p className="text-slate-700 mb-6 italic line-clamp-4 text-sm leading-relaxed">{testimonial.text}</p>
                  <div className="flex items-center">
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-blue-100 shadow-sm mr-4 profile-img transition-transform duration-300">
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 text-base">{testimonial.name}</h4>
                      <p className="text-sm text-slate-600">{testimonial.role}</p>
                      <div className="flex mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < testimonial.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Marquee Row 2 - Moves RIGHT (faster: 30s) */}
            <div className="flex animate-marquee-right">
              {[...duplicatedTestimonials].reverse().map((testimonial, index) => (
                <div 
                  key={`second-${testimonial.id}-${index}`} 
                  className="flex-shrink-0 w-80 mx-4 testimonial-card bg-white rounded-2xl p-6 shadow-md"
                >
                  <Quote className="w-8 h-8 text-emerald-400 mb-4 quote-icon transition-transform duration-300" />
                  <p className="text-slate-700 mb-6 italic line-clamp-4 text-sm leading-relaxed">{testimonial.text}</p>
                  <div className="flex items-center">
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-emerald-100 shadow-sm mr-4 profile-img transition-transform duration-300">
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 text-base">{testimonial.name}</h4>
                      <p className="text-sm text-slate-600">{testimonial.role}</p>
                      <div className="flex mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < testimonial.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* CTA below testimonials */}
          <div className="text-center mt-16">
            <Link 
              to="/register" 
              className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 text-white px-10 py-4 rounded-xl font-bold text-lg hover:shadow-xl hover:scale-105 transition-all shadow-md"
            >
              Join Our Community
              <ArrowRight className="ml-3 w-5 h-5" />
            </Link>
            <p className="text-slate-500 text-sm mt-4">
              Join {stats[0].number} learners and {stats[1].number} tutors already transforming education
            </p>
          </div>
        </div>
      </section>

      {/* Footer - PERFECT LOGO ALIGNMENT */}
      <footer className="bg-gray-900 text-gray-300 py-10 reveal">
        <div className="max-w-2xl mx-auto text-center px-4">
          <div className="flex items-center justify-center gap-2 mb-4" aria-hidden="true">
            {peerlearnLogo ? (
              <img 
                src={peerlearnLogo} 
                alt="PeerLearn Logo" 
                className="h-20 w-auto mr-2"
              />
            ) : (
              <Users className="w-8 h-8 text-blue-500 mr-2" />
            )}
            <span className="text-white font-bold text-xl mt-1">PeerLearn</span> {/* mt-1 for alignment */}
          </div>

          <p className="text-sm text-gray-400 mb-3">
            Empowering students through collaborative peer-to-peer academic learning.
          </p>

          <p className="text-xs text-gray-500">
            © 2026 PeerLearn. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Video Modal */}
      {videoPlaying && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-fade-in-up">
          <div className="relative w-full max-w-4xl">
            <button 
              onClick={() => setVideoPlaying(false)}
              className="absolute -top-12 right-0 text-white hover:text-blue-300 text-lg transition hover:scale-110"
            >
              Close ×
            </button>
            <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl overflow-hidden border border-white/10">
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <Play className="w-20 h-20 text-white mx-auto mb-6" />
                  <p className="text-white text-xl mb-2">Platform Demo Video</p>
                  <p className="text-slate-400">See how PeerLearn transforms learning experiences</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;