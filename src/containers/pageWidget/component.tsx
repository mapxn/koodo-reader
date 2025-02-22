import React from "react";
import "./background.css";
import { BackgroundProps, BackgroundState } from "./interface";
import { ConfigService } from "../../assets/lib/kookit-extra-browser.min";
import { Trans } from "react-i18next";
import { scrollContents } from "../../utils/common";
class Background extends React.Component<BackgroundProps, BackgroundState> {
  isFirst: Boolean;
  constructor(props: any) {
    super(props);
    this.state = {
      isSingle: this.props.readerMode !== "double",
      prevPage: 0,
      nextPage: 0,
      scale: ConfigService.getReaderConfig("scale") || 1,
      isHideFooter: ConfigService.getReaderConfig("isHideFooter") === "yes",
      isHideHeader: ConfigService.getReaderConfig("isHideHeader") === "yes",
    };
    this.isFirst = true;
  }

  async UNSAFE_componentWillReceiveProps(nextProps: BackgroundProps) {
    if (nextProps.htmlBook !== this.props.htmlBook && nextProps.htmlBook) {
      await this.handlePageNum(nextProps.htmlBook.rendition);
      nextProps.htmlBook.rendition.on("page-changed", async () => {
        await this.handlePageNum(nextProps.htmlBook.rendition);
        this.handleLocation();
      });
    }
  }
  handleLocation = () => {
    let position = this.props.htmlBook.rendition.getPosition();
    ConfigService.setObjectConfig(
      this.props.currentBook.key,
      position,
      "recordLocation"
    );
    scrollContents(position.chapterTitle, position.chapterHref);
  };
  async handlePageNum(rendition) {
    let pageInfo = await rendition.getProgress();
    this.setState({
      prevPage: this.state.isSingle
        ? pageInfo.currentPage
        : pageInfo.currentPage * 2 - 1,
      nextPage: this.state.isSingle
        ? pageInfo.currentPage
        : pageInfo.currentPage * 2,
    });
  }

  render() {
    return (
      <div
        className="background"
        style={{
          color: ConfigService.getReaderConfig("textColor")
            ? ConfigService.getReaderConfig("textColor")
            : "",
          width: !this.props.isNavLocked ? "100%" : "calc(100% - 300px)",
          left: !this.props.isNavLocked ? "0" : "300px",
          backgroundColor:
            ConfigService.getReaderConfig("isMergeWord") === "yes"
              ? "rgba(0,0,0,0)"
              : ConfigService.getReaderConfig("backgroundColor")
              ? ConfigService.getReaderConfig("backgroundColor")
              : ConfigService.getReaderConfig("appSkin") === "night" ||
                (ConfigService.getReaderConfig("appSkin") === "system" &&
                  ConfigService.getReaderConfig("isOSNight") === "yes")
              ? "rgba(44,47,49,1)"
              : "rgba(255,255,255,1)",
          filter: `brightnessbrightness(${
            ConfigService.getReaderConfig("brightness") || 1
          }) invert(${
            ConfigService.getReaderConfig("isInvert") === "yes" ? 1 : 0
          })`,
        }}
      >
        <div className="header-container">
          {!this.state.isHideHeader && this.props.currentChapter + "" && (
            <p
              className="header-chapter-name"
              style={
                this.state.isSingle
                  ? {
                      left: `calc(50vw - 
                      270px)`,
                    }
                  : {}
              }
            >
              {this.props.currentChapter}
            </p>
          )}
          {!this.state.isHideHeader &&
            this.props.currentChapter + "" &&
            !this.state.isSingle && (
              <p
                className="header-book-name"
                style={
                  this.state.isSingle
                    ? {
                        right: `calc(50vw - 
                      270px)`,
                      }
                    : {}
                }
              >
                {this.props.currentBook.name}
              </p>
            )}
        </div>
        <div className="footer-container">
          {!this.state.isHideFooter && this.state.prevPage > 0 && (
            <p
              className="background-page-left"
              style={
                this.state.isSingle
                  ? {
                      left: `calc(50vw - 
                      270px)`,
                    }
                  : {}
              }
            >
              <Trans i18nKey="Book page" count={this.state.prevPage}>
                Page
                {{
                  count: this.state.prevPage,
                }}
              </Trans>
            </p>
          )}
          {!this.state.isHideFooter &&
            this.state.nextPage > 0 &&
            !this.state.isSingle && (
              <p className="background-page-right">
                <Trans i18nKey="Book page" count={this.state.nextPage}>
                  Page
                  {{
                    count: this.state.nextPage,
                  }}
                </Trans>
              </p>
            )}
        </div>
        <>
          {this.props.isShowBookmark ? <div className="bookmark"></div> : null}
        </>
      </div>
    );
  }
}

export default Background;
