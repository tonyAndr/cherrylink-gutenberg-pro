import {Button, Tooltip} from '@wordpress/components'
import React, { Component } from 'react'
import LinkWithInsertAction from '../HOC/withLinkInsert'

class SuggestionInsert extends Component {
    render() {
        const {clickHandler} = this.props;
        return (
            <Tooltip text="Вставить ссылку в нужное место"><Button
                className="insert-allowed is-secondary"
                onClick={clickHandler}>Вставить в текст</Button></Tooltip>
        )
    }
}
// SuggestionInsert.contextType = NoticeContext;

SuggestionInsert.fullName = "SuggestionInsert";
export default LinkWithInsertAction(SuggestionInsert);