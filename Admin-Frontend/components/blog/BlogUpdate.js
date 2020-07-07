import Link from 'next/link';
import { useState, useCallback, useEffect } from 'react';
import Router from 'next/router';
import dynamic from 'next/dynamic';
import { withRouter } from 'next/router';
import { getCookie, isAuth } from '../../actions/auth';
import { getTags } from '../../actions/tag';
import { singleBlog, updateBlog } from '../../actions/blog';

import EditorJs from "react-editor-js";
import { EDITOR_JS_TOOLS } from "./editorjs-constants";
// import ModalExample from './ModalExample'


import { API } from '../../config';
import {Button, Card, Layout, SkeletonBodyText, SkeletonDisplayText,
    SkeletonPage, TextContainer, EmptyState, OptionList, TextField } from '@shopify/polaris';
import { ResourcePicker, TitleBar } from '@shopify/app-bridge-react';
import ResourceListWithProducts from '../ResourceList';
import store from 'store-js';

const BlogUpdate = ({ shop, router }) => {

    const [title, setTitle] = useState('');
    const [body, setBody] = useState({});
    const [tags, setTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]); //polaris tags selected state
    const [selectedProducts, setSelectedProducts] = useState([]);

    const [modalState, setModalState] = useState(false);
   
    const handleTitleChange = useCallback((newValue) => setTitle(newValue), []);
    const handleBodyChange = useCallback((newValue) => {
        newValue.blocks.count = getBlocksCount();
        newValue.blocks.firstItem = newValue.blocks.getBlockByIndex(0);

        console.log('newValue in handleBodyChange', newValue)
        setBody(newValue)
    });

    const [values, setValues] = useState({
        error: '',
        success: '',
        body: {}
    });

    const { error, success, formData } = values;
    console.log('selectedTags in BlogUpdate function', selectedTags);


    const token = getCookie('token');

    useEffect(() => {
        setValues({ ...values });
        initBlog();
        initTags();
        initSelectedProducts();
    }, [router]);

    const initBlog = () => {
        if (router.query.slug) {
            singleBlog(router.query.slug).then(data => {
                console.log('blog data:', data);
                if (data.error) {
                    console.log(data.error);
                } else {
                    setTitle(data.title);
                    setBody(data.body);
                    setTagsArray(data.tags);
                }
            });
        }
    };

    const initSelectedProducts = () => {
      return setSelectedProducts(store.get('ids'));
    }

    const setTagsArray = blogTags => {
        console.log('ran setTagsArray func with :', blogTags)
        let ta = [];
        blogTags ? blogTags.map((t, i) => {
            ta.push(t._id);
        }) : [];
        setSelectedTags(ta);
    };

    const initTags = () => {
        getTags(shop).then(data => {
            if (data.error) {
                setValues({ ...values, error: data.error });
            } else {
                setTags(data);
            }
        });
    };

    const showPolarisTags = () => {

        let tagsArray = tags ? tags.map((t, i) => (
            {value: t._id, label: t.name}
        )) : [];

        return (
            <Card>
              <OptionList
                title="Categorize and Increase Visibility with Tags"
                onChange={setSelectedTags}
                options={tagsArray}
                selected={selectedTags}
                allowMultiple
              />
            </Card>
        )
    };

    const showSelectedProducts = () => {
        return selectedProducts ?  
             (
                <Card>
                  {selectedProducts.map((product, i) => (
                      <p key={i}>{product}</p>
                  ))}
                </Card>
            ) : (   <Card>
                        <EmptyState
                            heading="Promote Related Products"
                            action={{
                              content: 'Select products',
                              onAction: () => setModalState(true),
                            }}
                            image={img}
                          >
                          <p>If no Products are selected, Tribet's AI will automatically
                           optimize for the bests Products to show alongside the post.</p>
                      </EmptyState>
                    </Card>
                 )   
    };

    const editBlog = e => {
        e.preventDefault();
        console.log('body in editBlog function: ',body);
        updateBlog({title, body, selectedTags, selectedProducts}, token, router.query.slug).then(data => {
            if(data){
                if (data.error) {
                    setValues({ ...values, error: data.error });
                } else {
                    setValues({ ...values, title: '', success: `Blog titled "${data.title}" is successfully updated` });
                    if (isAuth() && isAuth().role === 1) {
                        // Router.replace(`/admin/crud/${router.query.slug}`);
                        Router.replace(`/admin`);
                    } else if (isAuth() && isAuth().role === 0) {
                        // Router.replace(`/user/crud/${router.query.slug}`);
                        Router.replace(`/user`);
                    }
                }
            }
           
        });
    };

    const showError = () => (
        <div className="alert alert-danger" style={{ display: error ? '' : 'none' }}>
            {error}
        </div>
    );

    const showSuccess = () => (
        <div className="alert alert-success" style={{ display: success ? '' : 'none' }}>
            {success}
        </div>
    );

    const handleSelection = (resources) => {
        const idsFromResources = resources.selection.map((product) => product.id);
        setModalState(false)
        console.log(resources)
        console.log(idsFromResources)
        store.set('ids', idsFromResources);
    };

    const emptyState = !store.get('ids');
    const img = 'https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg';

    return (
       <SkeletonPage title={title} type="input" primaryAction secondaryActions={2}>
           {showSuccess()}
           {showError()}
           <ResourcePicker
              resourceType="Product"
              showVariants={false}
              open={modalState}
              onSelection={(resources) => handleSelection(resources)}
              onCancel={() => setModalState(false)}
            />
           <Button primary onClick={editBlog}>Publish</Button>
              <Layout>
                <Layout.Section>
                  <Card sectioned title="Title">
                    <TextField label="Post Title" value={title} onChange={handleTitleChange} />
                  </Card>
                  <Card sectioned title="Content">
                    <EditorJs
                        tools={EDITOR_JS_TOOLS}
                        data={body ? body[0] : {}}
                        enableReInitialize={true}
                      />
                  </Card>
                  <Card sectioned title="Variants">
                    <SkeletonBodyText />
                  </Card>
                </Layout.Section>
                <Layout.Section secondary>
                  <Card title="Tags">
                    <Card.Section>
                      {showPolarisTags()}
                    </Card.Section>
                    <Card.Section>
                      <SkeletonBodyText lines={1} />
                    </Card.Section>
                  </Card>
                  <Card title="Promoted Products" subdued>
                    <Card.Section>
                        <TitleBar
                          primaryAction={{
                            content: 'Select Related Products',
                            onAction: () => setModalState(true),
                          }}
                        />
                    {showSelectedProducts()}
                    </Card.Section>
                    <Card.Section>
                      <SkeletonBodyText lines={2} />
                    </Card.Section>
                  </Card>
                </Layout.Section>
              </Layout>
        </SkeletonPage>
    );
};

export default withRouter(BlogUpdate);

