import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Redirect, Switch } from "react-router-dom";
import Login from "../pages/auth/login";
import AuthLayout from "../layout/auth";
import ForgotPassword from "../pages/auth/forgotPassword";
import EmailSent from "../pages/auth/emailSent";
import ResetPassword from "../pages/auth/resetPassword";
import MainLayout from "../layout";
import AdminDashboard from "../pages/super-admin/adminDashboard";
// import Referrals from "../pages/super-admin/referrals";
import { COURT_USER, SUPER_ADMIN } from "../constants";
import CourtDashboard from "../pages/court-user/courtDashboard";
import VerifyOtp from "../pages/auth/verifyOtp";
import Questions from "../pages/super-admin/question";
import QuestionDetails from "../pages/super-admin/question/show";
import ListstyleQuestions from "../pages/super-admin/liststyle-questions";
import ListstyleQuestionDetails from "../pages/super-admin/liststyle-questions/show";
import CourtUserBookings from "../pages/court-user/booking";
import CourtUserPayments from "../pages/court-user/payment";
import Users from "../pages/super-admin/user";
import UserDetails from "../pages/super-admin/user/show";
import UserForm from "../pages/super-admin/user/form";
import Payments from "../pages/super-admin/payment";
import Courts from "../pages/super-admin/court";
// import Events from "../pages/super-admin/events";
// import Waitlist from "../pages/super-admin/events/waitlist";
// import UserVerification from "../pages/super-admin/user_verification";
import CourtUserProfile from "../pages/court-user/profile";
import NotFound from "../pages/not-found";
// import Memberships from "../pages/super-admin/membership-plan";

const AuthRedirect = ({ destination }) => {
    return <Route render={(props) => (<Redirect to={{ pathname: destination, state: { from: props.location } }} />)} />
}

const wrapper = (Layout, Component) => {

    let accessToken = localStorage.getItem('token');

    const redirect = <AuthRedirect destination={'/login'} />

    if (accessToken == null) return redirect;

    return (
        <Layout>
            <Component />
        </Layout>
    )
}

export default function Navigation() {

    const [userRole, setUserRole] = useState(localStorage.getItem('role') ?? null)
    const [loginKey, setLoginKey] = useState(0);

    useEffect(() => {
        setUserRole(localStorage.getItem('role'))
    }, [loginKey]);

    const handleLogin = () => {
        setLoginKey(key => key + 1);
    };

    const handleNotFound = (Component) => {
        return localStorage.getItem('token') ? <MainLayout><Component /></MainLayout> : <Component />
    }

    const handleComponent = (adminComponent = null, courtComponent = null) => {

        if (userRole === SUPER_ADMIN && adminComponent) {
            return adminComponent;
        }

        if (userRole === COURT_USER && courtComponent) {
            return courtComponent;
        }

        return NotFound
    }

    return (
        <Router>
            <Switch>
                <Route exact path={'/login'} component={() => <AuthLayout><Login onLogin={handleLogin} /></AuthLayout>} />
                <Route exact path={'/forgot-password'} component={() => <AuthLayout><ForgotPassword /></AuthLayout>} />
                <Route exact path={'/email-sent'} component={() => <AuthLayout><EmailSent /></AuthLayout>} />
                <Route exact path={'/verify-otp'} component={() => <AuthLayout><VerifyOtp /></AuthLayout>} />
                <Route exact path={'/reset-password'} component={() => <AuthLayout><ResetPassword /></AuthLayout>} />

                <Route exact path={'/'} component={() => wrapper(MainLayout, handleComponent(AdminDashboard, CourtDashboard))} />
                <Route exact path={'/profile'} component={() => wrapper(MainLayout, handleComponent(null, CourtUserProfile))} />
                <Route exact path={'/users'} component={() => wrapper(MainLayout, handleComponent(Users, null))} />
                <Route exact path={'/users/:id?'} component={() => wrapper(MainLayout, handleComponent(UserDetails, null))} />
                <Route exact path={'/users/edit/:id?'} component={() => wrapper(MainLayout, handleComponent(UserForm, null))} />
                <Route exact path={'/payments'} component={() => wrapper(MainLayout, handleComponent(Payments, CourtUserPayments))} />
                <Route exact path={'/courts'} component={() => wrapper(MainLayout, handleComponent(Courts, null))} />
                <Route exact path={'/bookings'} component={() => wrapper(MainLayout, handleComponent(null, CourtUserBookings))} />
                {/* <Route exact path={'/events'} component={() => wrapper(MainLayout, handleComponent(Events, null))} />
                <Route exact path={'/events/waitlist/:id?'} component={() => wrapper(MainLayout, handleComponent(Waitlist, null))} />
                <Route exact path={'/referrals'} component={() => wrapper(MainLayout, handleComponent(Referrals, null))} /> */}
                <Route exact path={'/questions'} component={() => wrapper(MainLayout, handleComponent(Questions, null))} />
                <Route exact path={'/questions/:id?'} component={() => wrapper(MainLayout, handleComponent(QuestionDetails, null))} />
                <Route exact path={'/liststyle-questions'} component={() => wrapper(MainLayout, handleComponent(ListstyleQuestions, null))} />
                <Route exact path={'/liststyle-questions/:id?'} component={() => wrapper(MainLayout, handleComponent(ListstyleQuestionDetails, null))} />
                {/* <Route exact path={'/user-verification'} component={() => wrapper(MainLayout, handleComponent(UserVerification, null))} />
                <Route exact path={'/membership-plans'} component={() => wrapper(MainLayout, handleComponent(Memberships, null))} /> */}

                <Route path="*" component={() => handleNotFound(NotFound)} />
            </Switch>
        </Router>
    )
}