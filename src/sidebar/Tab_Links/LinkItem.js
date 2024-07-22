import React from 'react';
import LinkWithInsertAction from '../HOC/withLinkInsert';
import { showNotice } from '../Notices';
import { Tooltip } from '@wordpress/components';

class LinkItem extends React.Component {

    constructor(props) {
        super(props);

    }

    findSuggestions(sugg) {
        const { showSuggestions, linkObj } = this.props;

        // Saving scroll position of links list to be able to return 
        // to the same place after suggestions will be closed
        let element = document.querySelector(".editor-sidebar")
        if (element === null) {
            element = document.querySelector(".edit-post-sidebar")
        }
        const scrollPos = element.scrollTop;

        showSuggestions({ rawKeywords: sugg, linkItem: linkObj }, scrollPos);
    }


    decodeHtml(html) {
        var txt = document.createElement("textarea");
        txt.innerHTML = html;
        return txt.value;
    }

    render() {

        const { linkObj, editUrl, clickHandler, copyLink, postMeta, inArticle, changeBlockLinks, onMetaChange, isIncoming } = this.props;
        const postId = linkObj["data-postid"],
            url = linkObj["data-url"],
            title = cherrylink_options.templates.isH1 === "true" ? this.decodeHtml(linkObj["data-title"]) : this.decodeHtml(linkObj["data-titleseo"]),
            incoming = linkObj["data-incoming"],
            outgoing = linkObj["data-outgoing"],
            sugg = linkObj["data-suggestions"];

        let inBlock = false;

        postMeta.blockLinks.forEach(element => {
            if (element.post_id === postId) {
                inBlock = true;
            }
        });

        const containerClass = inArticle ? `link-item-container insert-allowed inArticle` : "link-item-container insert-allowed";

        return (
            <div className={containerClass}>
                <span className={isIncoming ? 'incoming-link' : 'not-incoming'}>{title}</span>
                <div className='link-toolbar-overlay  insert-allowed'>
                    <div className='toolbar-actions'>
                        <div onMouseDown={clickHandler} className="insert-allowed main-action">
                            <Tooltip text="Вставить ссылку">
                                <img className="insert-allowed" src="/wp-content/plugins/cherrylink-pro/assets/gutenberg/insert_link.png" alt="" />
                            </Tooltip>
                        </div>
                        <div className="main-action" onMouseDown={(e) => {
                            e.stopPropagation();
                            this.findSuggestions(sugg)
                        }}>
                            <Tooltip text="Подсказки анкоров">
                                <img src="/wp-content/plugins/cherrylink-pro/assets/gutenberg/find_suggestions.png" alt="Подсказки" />
                            </Tooltip>
                        </div>
                        {/* <div onMouseDown={() => changeBlockLinks(postId, title, postMeta, onMetaChange)}>
                            <img src={inBlock ? "/wp-content/plugins/cherrylink-pro/assets/gutenberg/del_from_block2.png" :
                                "/wp-content/plugins/cherrylink-pro/assets/gutenberg/add_to_block2.png"}
                                title={inBlock ? "Убрать из блока ссылок" : "Добавить в блок ссылок"} alt="" />
                        </div> */}
                    </div>
                    <div className='toolbar-article'>
                        <div onMouseDown={() => copyLink(url)}>
                            <Tooltip text="Копировать ссылку">
                                <img src="/wp-content/plugins/cherrylink-pro/assets/gutenberg/copy_link.png" alt="" />
                            </Tooltip>
                        </div>
                        <div>
                        <Tooltip text="Просмотр статьи">
                            <a target='_blank' href={url}><img src="/wp-content/plugins/cherrylink-pro/assets/gutenberg/look_page.png" alt="" /></a>
                        </Tooltip>
                        </div>
                        <div>
                            <Tooltip text="Редактировать статью">
                            <a target='_blank' href={`${editUrl}?post=${postId}&action=edit`}>
                            <img src="/wp-content/plugins/cherrylink-pro/assets/gutenberg/edit_page.png" alt="" /></a>
                            </Tooltip>
                        </div>
                    </div>
                    <div className='toolbar-stats'>
                        <div>
                            <div><Tooltip text="Исходящие ссылки"><span>🠅 {outgoing}</span></Tooltip></div><div><Tooltip text="Входящие ссылки"><span>🠇 {incoming}</span></Tooltip></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

LinkItem.fullName = "LinkItem";

export default LinkWithInsertAction(LinkItem);