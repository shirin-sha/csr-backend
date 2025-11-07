import PropTypes from "prop-types";
import React, { useEffect, useRef, useCallback } from "react";

//Import Icons
import Icon from "@ailibs/feather-react-ts";

// //Import Scrollbar
import SimpleBar from "simplebar-react";

//Import images
import giftBox from "../../assets/images/giftbox.png";

//i18n
import { withTranslation } from "react-i18next";

// MetisMenu
import MetisMenu from "metismenujs";
import { Link, withRouter } from "react-router-dom";

const SidebarContent = (props: any) => {
  const ref = useRef<any>();
  const role =
  typeof window !== "undefined" &&
  parseInt(localStorage.getItem("role") ?? "");
  console.log(role);
  
  const activateParentDropdown = useCallback((item: any) => {
    item.classList.add("active");
    const parent = item.parentElement;
    const parent2El = parent.childNodes[1];
    if (parent2El && parent2El.id !== "side-menu") {
      parent2El.classList.add("mm-show");
    }

    if (parent) {
      parent.classList.add("mm-active");
      const parent2 = parent.parentElement;

      if (parent2) {
        parent2.classList.add("mm-show"); // ul tag

        const parent3 = parent2.parentElement; // li tag

        if (parent3) {
          parent3.classList.add("mm-active"); // li
          parent3.childNodes[0].classList.add("mm-active"); //a
          const parent4 = parent3.parentElement; // ul
          if (parent4) {
            parent4.classList.add("mm-show"); // ul
            const parent5 = parent4.parentElement;
            if (parent5) {
              parent5.classList.add("mm-show"); // li
              parent5.childNodes[0].classList.add("mm-active"); // a tag
            }
          }
        }
      }
      scrollElement(item);
      return false;
    }
    scrollElement(item);
    return false;
  }, []);

  // Use ComponentDidMount and ComponentDidUpdate method symultaniously
  useEffect(() => {
    const pathName = props.location.pathname;

    const initMenu = () => {
      new MetisMenu("#side-menu");
      let matchingMenuItem = null;
      const ul: any = document.getElementById("side-menu");
      const items = ul.getElementsByTagName("a");
      for (let i = 0; i < items.length; ++i) {
        if (pathName === items[i].pathname) {
          matchingMenuItem = items[i];
          break;
        }
      }
      if (matchingMenuItem) {
        activateParentDropdown(matchingMenuItem);
      }
    };
    initMenu();
  }, [props.location.pathname, activateParentDropdown]);

  useEffect(() => {
    ref.current.recalculate();
  });

  function scrollElement(item: any) {
    if (item) {
      const currentPosition = item.offsetTop;
      if (currentPosition > window.innerHeight) {
        ref.current.getScrollElement().scrollTop = currentPosition - 300;
      }
    }
  }
if(role===0){
  return (
    <React.Fragment>
      <SimpleBar style={{ maxHeight: "100%" }} ref={ref}>
        <div id="sidebar-menu">
          <ul className="metismenu list-unstyled" id="side-menu">
            <li className="menu-title">{props.t("Menu")} </li>
            <li>
              <Link to="/dashboard" className="">
                <Icon name="home" />
                <span>{props.t("Dashboard")}</span>
              </Link>
            </li>
            <li>
              <Link to="/#" className="has-arrow ">
                <Icon name="airplay"></Icon>
                <span> {props.t("CMS")}</span>
              </Link>
              <ul className="sub-menu">
                <li>
                  <Link to="/banners" className="">
                    <span>{props.t("Banners")}</span>
                  </Link>
                </li>
                <li>
                  <Link to="/contact-us" className="">
                    <span>{props.t("Contact Us")}</span>
                  </Link>
                </li>
                <li>
                  <Link to="/our-project" className="">
                    <span>{props.t("Our Project")}</span>
                  </Link>
                </li>
                <li>
                  <Link to="/blogs" className="">
                    <span>{props.t("Latest News and Update")}</span>
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="">
                    <span>{props.t("FAQ")}</span>
                  </Link>
                </li>
              </ul>
            </li>
            <li>
              <Link to="/add-admin" className="">
                <Icon name="user-plus" />
                <span>{props.t("Add Admin")}</span>
              </Link>
            </li>
            <li>
              <Link to="/#" className="has-arrow ">
                <Icon name="command"></Icon>
                <span> {props.t("Masters")}</span>
              </Link>
              <ul className="sub-menu">
                <li>
                  <Link to="/price-matrix" className="">
                    <span>{props.t("Price Configuration")}</span>
                  </Link>
                </li>
                <li>
                  <Link to="/categories" className="">
                    <span>{props.t("Categories")}</span>
                  </Link>
                </li>
              </ul>
            </li>
            <li>
              <Link to="/inquiries" className="">
                <Icon name="message-square" />
                <span>{props.t("Inquiries")}</span>
              </Link>
            </li>
            <li>
              <Link to="/logs" className="">
                <Icon name="message-square" />
                <span>{props.t("Activity Logs")}</span>
              </Link>
            </li>
            <li>
              <Link to="/add-user" className="">
                <Icon name="user-plus" />
                <span>{props.t("Add User")}</span>
              </Link>
            </li>
            <li>
              <Link to="/applicants" className="">
                <Icon name="users" />
                <span>{props.t("Applicant Master")}</span>
              </Link>
            </li>
            <li>
              <Link to="/organizers" className="">
                <Icon name="bookmark" />
                <span>{props.t("Event Organizer Master")}</span>
              </Link>
            </li>
            <li>
              <Link to="/sponsors" className="">
                <Icon name="shopping-bag" />
                <span>{props.t("Sponsor Master")}</span>
              </Link>
            </li>
            <li>
              <Link to="/projects" className="">
                <Icon name="book" />
                <span>{props.t("Project Master")}</span>
              </Link>
            </li>
          </ul>
        </div>
      </SimpleBar>
    </React.Fragment>
  )}
  else if(role===10){
    return(
      <React.Fragment>
      <SimpleBar style={{ maxHeight: "100%" }} ref={ref}>
        <div id="sidebar-menu">
          <ul className="metismenu list-unstyled" id="side-menu">
            <li className="menu-title">{props.t("Menu")} </li>
            <li>
              <Link to="/dashboard" className="">
                <Icon name="home" />
                <span>{props.t("Dashboard")}</span>
              </Link>
            </li>
           
            <li>
              <Link to="/inquiries" className="">
                <Icon name="message-square" />
                <span>{props.t("Inquiries")}</span>
              </Link>
            </li>
           
            <li>
              <Link to="/add-user" className="">
                <Icon name="user-plus" />
                <span>{props.t("Add User")}</span>
              </Link>
            </li>
            <li>
              <Link to="/applicants" className="">
                <Icon name="users" />
                <span>{props.t("Applicant Master")}</span>
              </Link>
            </li>
           
          </ul>
        </div>
      </SimpleBar>
    </React.Fragment>
    )
  }
  else if(role===20){
    return(
      <React.Fragment>
      <SimpleBar style={{ maxHeight: "100%" }} ref={ref}>
        <div id="sidebar-menu">
          <ul className="metismenu list-unstyled" id="side-menu">
            <li className="menu-title">{props.t("Menu")} </li>
            <li>
              <Link to="/dashboard" className="">
                <Icon name="home" />
                <span>{props.t("Dashboard")}</span>
              </Link>
            </li>
           
            <li>
              <Link to="/inquiries" className="">
                <Icon name="message-square" />
                <span>{props.t("Inquiries")}</span>
              </Link>
            </li>
           
            <li>
              <Link to="/add-user" className="">
                <Icon name="user-plus" />
                <span>{props.t("Add User")}</span>
              </Link>
            </li>
           
            <li>
              <Link to="/sponsors" className="">
                <Icon name="shopping-bag" />
                <span>{props.t("Sponsor Master")}</span>
              </Link>
            </li>
           
          </ul>
        </div>
      </SimpleBar>
    </React.Fragment>
    )
  }
  else if(role===30){
    return(
      <React.Fragment>
      <SimpleBar style={{ maxHeight: "100%" }} ref={ref}>
        <div id="sidebar-menu">
          <ul className="metismenu list-unstyled" id="side-menu">
            <li className="menu-title">{props.t("Menu")} </li>
            <li>
              <Link to="/dashboard" className="">
                <Icon name="home" />
                <span>{props.t("Dashboard")}</span>
              </Link>
            </li>
            
            <li>
              <Link to="/inquiries" className="">
                <Icon name="message-square" />
                <span>{props.t("Inquiries")}</span>
              </Link>
            </li>
           
            <li>
              <Link to="/add-user" className="">
                <Icon name="user-plus" />
                <span>{props.t("Add User")}</span>
              </Link>
            </li>
           
            <li>
              <Link to="/organizers" className="">
                <Icon name="bookmark" />
                <span>{props.t("Event Organizer Master")}</span>
              </Link>
            </li>
           
          </ul>
        </div>
      </SimpleBar>
    </React.Fragment>
    )
  }
  else{
    return(
      <React.Fragment>
      <SimpleBar style={{ maxHeight: "100%" }} ref={ref}>
        <div id="sidebar-menu">
          <ul className="metismenu list-unstyled" id="side-menu">
            <li className="menu-title">{props.t("Menu")} </li>
            <li>
              <Link to="/dashboard" className="">
                <Icon name="home" />
                <span>{props.t("Dashboard")}</span>
              </Link>
            </li>
            {/* <li>
              <Link to="/#" className="has-arrow ">
                <Icon name="airplay"></Icon>
                <span> {props.t("CMS")}</span>
              </Link>
              <ul className="sub-menu">
                <li>
                  <Link to="/banners" className="">
                    <span>{props.t("Banners")}</span>
                  </Link>
                </li>
                <li>
                  <Link to="/contact-us" className="">
                    <span>{props.t("Contact Us")}</span>
                  </Link>
                </li>
                <li>
                  <Link to="/our-project" className="">
                    <span>{props.t("Our Project")}</span>
                  </Link>
                </li>
                <li>
                  <Link to="/blogs" className="">
                    <span>{props.t("Latest News and Update")}</span>
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="">
                    <span>{props.t("FAQ")}</span>
                  </Link>
                </li>
              </ul>
            </li> */}
           
            {/* <li>
              <Link to="/#" className="has-arrow ">
                <Icon name="command"></Icon>
                <span> {props.t("Masters")}</span>
              </Link>
              <ul className="sub-menu">
                <li>
                  <Link to="/price-matrix" className="">
                    <span>{props.t("Price Configuration")}</span>
                  </Link>
                </li>
                <li>
                  <Link to="/categories" className="">
                    <span>{props.t("Categories")}</span>
                  </Link>
                </li>
              </ul>
            </li> */}
            <li>
              <Link to="/inquiries" className="">
                <Icon name="message-square" />
                <span>{props.t("Inquiries")}</span>
              </Link>
            </li>
           
            <li>
              <Link to="/add-user" className="">
                <Icon name="user-plus" />
                <span>{props.t("Add User")}</span>
              </Link>
            </li>
           
            <li>
              <Link to="/projects" className="">
                <Icon name="book" />
                <span>{props.t("Project Master")}</span>
              </Link>
            </li>
          </ul>
        </div>
      </SimpleBar>
    </React.Fragment>
    )
  }
};

SidebarContent.propTypes = {
  location: PropTypes.object,
  t: PropTypes.any,
};

export default withTranslation()(withRouter(SidebarContent));
