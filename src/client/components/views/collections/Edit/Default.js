import React from 'react';
import PropTypes from 'prop-types';
import { Link, useRouteMatch, useLocation } from 'react-router-dom';
import format from 'date-fns/format';
import config from 'payload/config';
import Eyebrow from '../../../elements/Eyebrow';
import Form from '../../../forms/Form';
import PreviewButton from '../../../elements/PreviewButton';
import FormSubmit from '../../../forms/Submit';
import RenderFields from '../../../forms/RenderFields';
import CopyToClipboard from '../../../elements/CopyToClipboard';
import DuplicateDocument from '../../../elements/DuplicateDocument';
import DeleteDocument from '../../../elements/DeleteDocument';
import * as fieldTypes from '../../../forms/field-types';
import RenderTitle from '../../../elements/RenderTitle';
import LeaveWithoutSaving from '../../../modals/LeaveWithoutSaving';

import './index.scss';

const { serverURL, routes: { api, admin } } = config;

const baseClass = 'collection-edit';

const DefaultEditView = (props) => {
  const { params: { id } = {} } = useRouteMatch();

  const {
    collection, isEditing, data, onSave,
  } = props;

  const {
    slug,
    fields,
    useAsTitle,
    timestamps,
    preview,
    auth,
  } = collection;

  const apiURL = `${serverURL}${api}/${slug}/${id}`;
  let action = `${serverURL}${api}/${slug}${isEditing ? `/${id}` : ''}`;

  if (auth && !isEditing) {
    action = `${action}/register`;
  }

  const classes = [
    baseClass,
    isEditing && `${baseClass}--is-editing`,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <Form
        className={`${baseClass}__form`}
        method={id ? 'put' : 'post'}
        action={action}
        onSuccess={onSave}
      >
        <div className={`${baseClass}__main`}>
          <Eyebrow />
          <LeaveWithoutSaving />
          <div className={`${baseClass}__edit`}>
            <header className={`${baseClass}__header`}>
              <h1>
                <RenderTitle {...{ data, useAsTitle, fallback: '[Untitled]' }} />
              </h1>
            </header>
            <RenderFields
              filter={field => (!field.position || (field.position && field.position !== 'sidebar'))}
              fieldTypes={fieldTypes}
              fieldSchema={fields}
              initialData={data}
              customComponentsPath={`${slug}.fields.`}
            />
          </div>
        </div>
        <div className={`${baseClass}__sidebar`}>
          {isEditing ? (
            <ul className={`${baseClass}__collection-actions`}>
              <li><Link to={`${admin}/collections/${slug}/create`}>Create New</Link></li>
              <li><DuplicateDocument slug={slug} /></li>
              <li>
                <DeleteDocument
                  collection={collection}
                  id={id}
                />
              </li>
            </ul>
          ) : undefined}
          <div className={`${baseClass}__document-actions${(preview && isEditing) ? ` ${baseClass}__document-actions--with-preview` : ''}`}>
            {isEditing && (
              <PreviewButton generatePreviewURL={preview} />
            )}
            <FormSubmit>Save</FormSubmit>
          </div>
          {isEditing && (
            <div className={`${baseClass}__api-url`}>
              <span className={`${baseClass}__label`}>
                API URL
                {' '}
                <CopyToClipboard value={apiURL} />
              </span>
              <a
                href={apiURL}
                target="_blank"
                rel="noopener noreferrer"
              >
                {apiURL}
              </a>
            </div>
          )}
          <div className={`${baseClass}__sidebar-fields`}>
            <RenderFields
              filter={field => field.position === 'sidebar'}
              position="sidebar"
              fieldTypes={fieldTypes}
              fieldSchema={fields}
              initialData={data}
              customComponentsPath={`${slug}.fields.`}
            />
          </div>
          {isEditing && (
            <ul className={`${baseClass}__meta`}>
              <li>
                <div className={`${baseClass}__label`}>ID</div>
                <div>{id}</div>
              </li>
              {timestamps && (
                <>
                  {data.updatedAt && (
                    <li>
                      <div className={`${baseClass}__label`}>Last Modified</div>
                      <div>{format(new Date(data.updatedAt), 'MMMM do yyyy, h:mma')}</div>
                    </li>
                  )}
                  {data.createdAt && (
                    <li>
                      <div className={`${baseClass}__label`}>Created</div>
                      <div>{format(new Date(data.createdAt), 'MMMM do yyyy, h:mma')}</div>
                    </li>
                  )}
                </>
              )}

            </ul>
          )}
        </div>
      </Form>
    </div>
  );
};

DefaultEditView.defaultProps = {
  isEditing: false,
  data: undefined,
  onSave: null,
};

DefaultEditView.propTypes = {
  collection: PropTypes.shape({
    labels: PropTypes.shape({
      plural: PropTypes.string,
      singular: PropTypes.string,
    }),
    slug: PropTypes.string,
    useAsTitle: PropTypes.string,
    fields: PropTypes.arrayOf(PropTypes.shape({})),
    preview: PropTypes.func,
    timestamps: PropTypes.bool,
    auth: PropTypes.shape({}),
  }).isRequired,
  isEditing: PropTypes.bool,
  data: PropTypes.shape({
    updatedAt: PropTypes.string,
    createdAt: PropTypes.string,
  }),
  onSave: PropTypes.func,
};

export default DefaultEditView;
