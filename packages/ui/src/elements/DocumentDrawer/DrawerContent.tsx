'use client'

import { useModal } from '@faceless-ui/modal'
import React, { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import type { DocumentDrawerProps } from './types.js'

import { useRelatedCollections } from '../../fields/Relationship/AddNew/useRelatedCollections.js'
import { XIcon } from '../../icons/X/index.js'
import { RenderComponent } from '../../providers/Config/RenderComponent.js'
import { useConfig } from '../../providers/Config/index.js'
import { DocumentInfoProvider, useDocumentInfo } from '../../providers/DocumentInfo/index.js'
import { useLocale } from '../../providers/Locale/index.js'
import { useTranslation } from '../../providers/Translation/index.js'
import { Gutter } from '../Gutter/index.js'
import { IDLabel } from '../IDLabel/index.js'
import { RenderTitle } from '../RenderTitle/index.js'
import { baseClass } from './index.js'

export const DocumentDrawerContent: React.FC<DocumentDrawerProps> = ({
  id: existingDocID,
  Header,
  collectionSlug,
  drawerSlug,
  onCreate: onCreateFromProps,
  onDelete: onDeleteFromProps,
  onDuplicate: onDuplicateFromProps,
  onSave: onSaveFromProps,
  redirectAfterDelete,
  redirectAfterDuplicate,
}) => {
  const { config } = useConfig()

  const {
    routes: { api: apiRoute },
    serverURL,
  } = config

  const { closeModal, modalState, toggleModal } = useModal()
  const locale = useLocale()
  const { t } = useTranslation()
  const [docID, setDocID] = useState(existingDocID)
  const [isOpen, setIsOpen] = useState(false)
  const [collectionConfig] = useRelatedCollections(collectionSlug)

  const Edit = collectionConfig.admin.components.views.edit.default.Component

  const isEditing = Boolean(docID)
  const apiURL = docID
    ? `${serverURL}${apiRoute}/${collectionSlug}/${docID}${locale?.code ? `?locale=${locale.code}` : ''}`
    : null

  useEffect(() => {
    setIsOpen(Boolean(modalState[drawerSlug]?.isOpen))
  }, [modalState, drawerSlug])

  const onLoadError = React.useCallback(
    (data) => {
      if (isOpen) {
        closeModal(drawerSlug)
        toast.error(data.errors?.[0].message || t('error:unspecific'))
      }
    },
    [closeModal, drawerSlug, isOpen, t],
  )

  const onSave = useCallback<DocumentDrawerProps['onSave']>(
    (args) => {
      setDocID(args.doc.id)
      if (typeof onSaveFromProps === 'function') {
        void onSaveFromProps({
          ...args,
          collectionConfig,
        })
      }
    },
    [onSaveFromProps, collectionConfig],
  )

  const onDuplicate = useCallback<DocumentDrawerProps['onSave']>(
    (args) => {
      setDocID(args.doc.id)
      if (typeof onDuplicateFromProps === 'function') {
        void onDuplicateFromProps({
          ...args,
          collectionConfig,
        })
      }
    },
    [onDuplicateFromProps, collectionConfig],
  )

  const onCreate = useCallback<DocumentDrawerProps['onCreate']>(
    (args) => {
      setDocID(args.doc.id)
      if (typeof onCreateFromProps === 'function') {
        void onCreateFromProps({
          ...args,
          collectionConfig,
        })
      }
    },
    [onCreateFromProps, collectionConfig],
  )

  const onDelete = useCallback<DocumentDrawerProps['onDelete']>(
    (args) => {
      setDocID(args.doc.id)
      if (typeof onDeleteFromProps === 'function') {
        void onDeleteFromProps({
          ...args,
          collectionConfig,
        })
      }
    },
    [onDeleteFromProps, collectionConfig],
  )

  return (
    <DocumentInfoProvider
      BeforeDocument={
        <Gutter className={`${baseClass}__header`}>
          <div className={`${baseClass}__header-content`}>
            <h2 className={`${baseClass}__header-text`}>
              {Header || <RenderTitle element="span" />}
            </h2>
            {/* TODO: the `button` HTML element breaks CSS transitions on the drawer for some reason...
            i.e. changing to a `div` element will fix the animation issue but will break accessibility
          */}
            <button
              aria-label={t('general:close')}
              className={`${baseClass}__header-close`}
              onClick={() => toggleModal(drawerSlug)}
              type="button"
            >
              <XIcon />
            </button>
          </div>
          <DocumentTitle />
        </Gutter>
      }
      apiURL={apiURL}
      collectionSlug={collectionConfig.slug}
      disableLeaveWithoutSaving
      id={docID}
      isEditing={isEditing}
      onCreate={onCreate}
      onDelete={onDelete}
      onDuplicate={onDuplicate}
      onLoadError={onLoadError}
      onSave={onSave}
      redirectAfterDelete={redirectAfterDelete !== undefined ? redirectAfterDelete : false}
      redirectAfterDuplicate={redirectAfterDuplicate !== undefined ? redirectAfterDuplicate : false}
    >
      <RenderComponent mappedComponent={Edit} />
    </DocumentInfoProvider>
  )
}

const DocumentTitle: React.FC = () => {
  const { id, title } = useDocumentInfo()
  return id && id !== title ? <IDLabel id={id.toString()} /> : null
}
